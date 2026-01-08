"""
Supabase Storage Client using S3 API

Uses S3-compatible API for file uploads/downloads to Supabase Storage.
See: https://supabase.com/docs/guides/storage/s3/authentication

This client provides:
- Upload files (videos, PDFs, images)
- Download files
- Generate signed URLs for private files
- Delete files
- List files in a bucket
"""

import io
import uuid
from typing import BinaryIO
from functools import lru_cache
from urllib.parse import urlparse

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from ..config import get_settings


class SupabaseStorageClient:
    """
    S3-compatible client for Supabase Storage.
    
    Uses AWS SDK (boto3) to interact with Supabase Storage via S3 API.
    This provides full access to all S3 operations.
    
    Important: S3 access keys provide full access and bypass RLS.
    Use only on the server side.
    """
    
    def __init__(self):
        settings = get_settings()
        
        if not settings.s3_access_key_id or not settings.s3_access_key_secret:
            raise ValueError(
                "S3 credentials not configured. "
                "Set S3_ACCESS_KEY_ID and S3_ACCESS_KEY_SECRET in .env"
            )
        
        # Parse endpoint to get the base URL
        self.endpoint = settings.s3_endpoint
        self.region = settings.s3_region
        
        # Configure S3 client for Supabase
        # forcePathStyle is required for Supabase S3
        self.client = boto3.client(
            "s3",
            endpoint_url=self.endpoint,
            region_name=self.region,
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_access_key_secret,
            config=Config(
                s3={"addressing_style": "path"},  # Force path style
                signature_version="s3v4",
                retries={"max_attempts": 3, "mode": "adaptive"},
            ),
        )
        
        # Default buckets
        self.bucket_videos = settings.storage_bucket_videos
        self.bucket_pdfs = settings.storage_bucket_pdfs
        self.bucket_assets = settings.storage_bucket_assets
        
        # Extract project ref from endpoint for public URL generation
        parsed = urlparse(self.endpoint)
        self.project_ref = parsed.netloc.split(".")[0] if parsed.netloc else ""
    
    def upload_file(
        self,
        file_data: bytes | BinaryIO,
        path: str,
        bucket: str | None = None,
        content_type: str = "application/octet-stream",
    ) -> dict:
        """
        Upload a file to Supabase Storage.
        
        Args:
            file_data: File bytes or file-like object
            path: Path within the bucket (e.g., "course_123/lesson_456/video.mp4")
            bucket: Bucket name (defaults to videos bucket)
            content_type: MIME type of the file
            
        Returns:
            dict with 'key', 'bucket', 'url' (public URL if bucket is public)
        """
        bucket = bucket or self.bucket_videos
        
        # Sanitize path - remove leading slashes and ensure valid format
        path = path.lstrip('/').replace('//', '/')
        if not path:
            raise ValueError("File path cannot be empty")
        
        # Convert bytes to file-like object if needed
        if isinstance(file_data, bytes):
            file_data = io.BytesIO(file_data)
        
        # Reset file pointer to beginning
        if hasattr(file_data, 'seek'):
            file_data.seek(0)
        
        try:
            # Check if bucket exists first
            try:
                self.client.head_bucket(Bucket=bucket)
            except ClientError as e:
                error_code = e.response.get('Error', {}).get('Code', 'Unknown')
                if error_code == '404':
                    raise StorageError(
                        f"Bucket '{bucket}' does not exist. "
                        f"Please create it in Supabase Dashboard > Storage."
                    ) from e
                elif error_code == '403':
                    raise StorageError(
                        f"Access denied to bucket '{bucket}'. "
                        f"Check your S3 credentials and bucket permissions."
                    ) from e
                # Continue with upload attempt if it's not a bucket issue
            
            # Upload the file
            self.client.upload_fileobj(
                file_data,
                bucket,
                path,
                ExtraArgs={"ContentType": content_type},
            )
            
            return {
                "key": path,
                "bucket": bucket,
                "url": self._get_public_url(bucket, path),
            }
        except ClientError as e:
            # Extract detailed error information
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            error_detail = e.response.get('Error', {}).get('Detail', '')
            
            # Build comprehensive error message
            error_msg = f"Failed to upload file to bucket '{bucket}': "
            
            if error_code == 'NoSuchBucket':
                error_msg += f"Bucket '{bucket}' does not exist. Create it in Supabase Dashboard."
            elif error_code == 'AccessDenied' or error_code == '403':
                error_msg += f"Access denied. Check S3 credentials and bucket permissions."
            elif error_code == 'InvalidAccessKeyId':
                error_msg += f"Invalid S3 access key. Check S3_ACCESS_KEY_ID in .env"
            elif error_code == 'SignatureDoesNotMatch':
                error_msg += f"Invalid S3 secret key. Check S3_ACCESS_KEY_SECRET in .env"
            elif error_code == '540' or '540' in str(e):
                error_msg += f"Network/timeout error (540). Check: 1) Supabase endpoint is correct, 2) Network connectivity, 3) File size limits"
            else:
                error_msg += f"Error {error_code}: {error_message}"
                if error_detail:
                    error_msg += f" ({error_detail})"
            
            raise StorageError(error_msg) from e
        except Exception as e:
            raise StorageError(f"Unexpected error during upload: {str(e)}") from e
    
    def upload_video(
        self,
        video_data: bytes,
        course_id: str,
        lesson_id: str,
        filename: str = "video.mp4",
    ) -> dict:
        """
        Upload a video file (convenience method for Manim output).
        
        Args:
            video_data: Video bytes
            course_id: Course identifier
            lesson_id: Lesson identifier
            filename: Video filename
            
        Returns:
            dict with 'key', 'bucket', 'url'
        """
        path = f"{course_id}/{lesson_id}/{filename}"
        return self.upload_file(
            video_data,
            path,
            bucket=self.bucket_videos,
            content_type="video/mp4",
        )
    
    def download_file(
        self,
        path: str,
        bucket: str | None = None,
    ) -> bytes:
        """
        Download a file from Supabase Storage.
        
        Args:
            path: Path within the bucket
            bucket: Bucket name (defaults to assets bucket)
            
        Returns:
            File bytes
        """
        bucket = bucket or self.bucket_assets
        
        try:
            buffer = io.BytesIO()
            self.client.download_fileobj(bucket, path, buffer)
            buffer.seek(0)
            return buffer.read()
        except ClientError as e:
            raise StorageError(f"Failed to download file: {e}") from e
    
    def get_signed_url(
        self,
        path: str,
        bucket: str | None = None,
        expires_in: int = 3600,
    ) -> str:
        """
        Generate a signed URL for private file access.
        
        Args:
            path: Path within the bucket
            bucket: Bucket name
            expires_in: URL expiration time in seconds (default 1 hour)
            
        Returns:
            Signed URL string
        """
        bucket = bucket or self.bucket_assets
        
        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket, "Key": path},
                ExpiresIn=expires_in,
            )
            return url
        except ClientError as e:
            raise StorageError(f"Failed to generate signed URL: {e}") from e
    
    def delete_file(
        self,
        path: str,
        bucket: str | None = None,
    ) -> bool:
        """
        Delete a file from Supabase Storage.
        
        Args:
            path: Path within the bucket
            bucket: Bucket name
            
        Returns:
            True if deleted successfully
        """
        bucket = bucket or self.bucket_assets
        
        try:
            self.client.delete_object(Bucket=bucket, Key=path)
            return True
        except ClientError as e:
            raise StorageError(f"Failed to delete file: {e}") from e
    
    def list_files(
        self,
        prefix: str = "",
        bucket: str | None = None,
        max_keys: int = 1000,
    ) -> list[dict]:
        """
        List files in a bucket with optional prefix filter.
        
        Args:
            prefix: Path prefix to filter (e.g., "course_123/")
            bucket: Bucket name
            max_keys: Maximum number of files to return
            
        Returns:
            List of file objects with 'key', 'size', 'last_modified'
        """
        bucket = bucket or self.bucket_assets
        
        try:
            response = self.client.list_objects_v2(
                Bucket=bucket,
                Prefix=prefix,
                MaxKeys=max_keys,
            )
            
            files = []
            for obj in response.get("Contents", []):
                files.append({
                    "key": obj["Key"],
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"].isoformat(),
                })
            
            return files
        except ClientError as e:
            raise StorageError(f"Failed to list files: {e}") from e
    
    def file_exists(
        self,
        path: str,
        bucket: str | None = None,
    ) -> bool:
        """
        Check if a file exists in the bucket.
        
        Args:
            path: Path within the bucket
            bucket: Bucket name
            
        Returns:
            True if file exists
        """
        bucket = bucket or self.bucket_assets
        
        try:
            self.client.head_object(Bucket=bucket, Key=path)
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                return False
            raise StorageError(f"Failed to check file existence: {e}") from e
    
    def _get_public_url(self, bucket: str, path: str) -> str:
        """
        Generate public URL for a file (only works if bucket is public).
        
        For private buckets, use get_signed_url() instead.
        """
        if self.project_ref:
            return f"https://{self.project_ref}.supabase.co/storage/v1/object/public/{bucket}/{path}"
        return f"{self.endpoint}/{bucket}/{path}"
    
    def copy_file(
        self,
        source_path: str,
        dest_path: str,
        source_bucket: str | None = None,
        dest_bucket: str | None = None,
    ) -> dict:
        """
        Copy a file within or between buckets.
        
        Args:
            source_path: Source file path
            dest_path: Destination file path
            source_bucket: Source bucket (defaults to assets)
            dest_bucket: Destination bucket (defaults to source_bucket)
            
        Returns:
            dict with 'key', 'bucket', 'url'
        """
        source_bucket = source_bucket or self.bucket_assets
        dest_bucket = dest_bucket or source_bucket
        
        try:
            self.client.copy_object(
                CopySource={"Bucket": source_bucket, "Key": source_path},
                Bucket=dest_bucket,
                Key=dest_path,
            )
            
            return {
                "key": dest_path,
                "bucket": dest_bucket,
                "url": self._get_public_url(dest_bucket, dest_path),
            }
        except ClientError as e:
            raise StorageError(f"Failed to copy file: {e}") from e


class StorageError(Exception):
    """Custom exception for storage operations."""
    pass


@lru_cache
def get_storage_client() -> SupabaseStorageClient:
    """Get cached Supabase Storage client instance."""
    return SupabaseStorageClient()





