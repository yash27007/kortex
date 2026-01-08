"""
Storage API Endpoints

Provides endpoints for file upload/download operations using Supabase Storage.
These endpoints are useful for:
- Testing storage configuration
- Uploading PDFs for course generation
- Downloading generated videos
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from pydantic import BaseModel

from ..clients import get_storage_client, StorageError


router = APIRouter(prefix="/storage", tags=["storage"])


class UploadResponse(BaseModel):
    """Response for file upload."""
    key: str
    bucket: str
    url: str


class SignedUrlResponse(BaseModel):
    """Response for signed URL generation."""
    url: str
    expires_in: int


class FileListResponse(BaseModel):
    """Response for file listing."""
    files: list[dict]
    count: int


@router.post("/upload/{bucket}", response_model=UploadResponse)
async def upload_file(
    bucket: str,
    file: UploadFile = File(...),
    path: str | None = Query(None, description="Custom path within bucket"),
):
    """
    Upload a file to Supabase Storage.
    
    - **bucket**: Target bucket (videos, pdfs, assets)
    - **file**: File to upload
    - **path**: Optional custom path (defaults to filename)
    """
    try:
        storage = get_storage_client()
        
        # Validate filename
        if not file.filename:
            raise HTTPException(status_code=400, detail="File must have a filename")
        
        # Use provided path or default to filename with timestamp to avoid conflicts
        import time
        import os
        if path:
            file_path = path
        else:
            # Sanitize filename and add timestamp
            safe_filename = "".join(c for c in file.filename if c.isalnum() or c in "._- ")
            safe_filename = safe_filename.replace(" ", "_")
            timestamp = int(time.time())
            name, ext = os.path.splitext(safe_filename)
            file_path = f"{name}_{timestamp}{ext}"
        
        # Read file content
        content = await file.read()
        
        # Validate file size (50MB max)
        max_size = 50 * 1024 * 1024
        if len(content) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size ({len(content)} bytes) exceeds maximum allowed size (50MB)"
            )
        
        # Determine content type
        content_type = file.content_type or "application/octet-stream"
        
        result = storage.upload_file(
            file_data=content,
            path=file_path,
            bucket=bucket,
            content_type=content_type,
        )
        
        return UploadResponse(**result)
        
    except StorageError as e:
        # Log the full error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Storage upload error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Unexpected upload error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/download/{bucket}/{path:path}")
async def download_file(bucket: str, path: str):
    """
    Download a file from Supabase Storage.
    
    - **bucket**: Source bucket
    - **path**: File path within bucket
    """
    try:
        storage = get_storage_client()
        content = storage.download_file(path, bucket)
        
        # Determine content type from extension
        extension = path.split(".")[-1].lower()
        content_types = {
            "pdf": "application/pdf",
            "mp4": "video/mp4",
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "json": "application/json",
            "txt": "text/plain",
        }
        content_type = content_types.get(extension, "application/octet-stream")
        
        from fastapi.responses import Response
        return Response(
            content=content,
            media_type=content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{path.split("/")[-1]}"'
            },
        )
        
    except StorageError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/signed-url/{bucket}/{path:path}", response_model=SignedUrlResponse)
async def get_signed_url(
    bucket: str,
    path: str,
    expires_in: int = Query(3600, ge=60, le=604800, description="Expiration in seconds"),
):
    """
    Generate a signed URL for private file access.
    
    - **bucket**: Source bucket
    - **path**: File path within bucket
    - **expires_in**: URL expiration time in seconds (1 min to 7 days)
    """
    try:
        storage = get_storage_client()
        url = storage.get_signed_url(path, bucket, expires_in)
        
        return SignedUrlResponse(url=url, expires_in=expires_in)
        
    except StorageError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/list/{bucket}", response_model=FileListResponse)
async def list_files(
    bucket: str,
    prefix: str = Query("", description="Path prefix to filter"),
    max_keys: int = Query(100, ge=1, le=1000, description="Maximum files to return"),
):
    """
    List files in a bucket.
    
    - **bucket**: Bucket to list
    - **prefix**: Optional path prefix filter
    - **max_keys**: Maximum number of files to return
    """
    try:
        storage = get_storage_client()
        files = storage.list_files(prefix, bucket, max_keys)
        
        return FileListResponse(files=files, count=len(files))
        
    except StorageError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{bucket}/{path:path}")
async def delete_file(bucket: str, path: str):
    """
    Delete a file from Supabase Storage.
    
    - **bucket**: Source bucket
    - **path**: File path within bucket
    """
    try:
        storage = get_storage_client()
        storage.delete_file(path, bucket)
        
        return {"status": "deleted", "bucket": bucket, "path": path}
        
    except StorageError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def storage_health():
    """Check if storage is configured and accessible."""
    try:
        storage = get_storage_client()
        
        # Check each bucket exists
        buckets_status = {}
        for bucket_name, bucket in [
            ("videos", storage.bucket_videos),
            ("pdfs", storage.bucket_pdfs),
            ("assets", storage.bucket_assets),
        ]:
            try:
                storage.client.head_bucket(Bucket=bucket)
                buckets_status[bucket_name] = {"exists": True, "name": bucket}
            except Exception as e:
                error_code = getattr(e, 'response', {}).get('Error', {}).get('Code', 'Unknown')
                error_msg = str(e)
                buckets_status[bucket_name] = {
                    "exists": False,
                    "name": bucket,
                    "error": error_code,
                    "message": error_msg,
                }
        
        # Try to list files in the pdfs bucket to verify connection
        connection_status = "unknown"
        connection_error = None
        try:
            storage.list_files("", storage.bucket_pdfs, max_keys=1)
            connection_status = "connected"
        except Exception as e:
            connection_error = str(e)
            error_code = getattr(e, 'response', {}).get('Error', {}).get('Code', 'Unknown')
            if error_code == '540' or '540' in str(e):
                connection_status = "network_error"
            else:
                connection_status = "error"
        
        # Determine overall status
        all_exist = all(b.get("exists") for b in buckets_status.values())
        if connection_status == "network_error":
            overall_status = "network_error"
        elif connection_status == "connected" and all_exist:
            overall_status = "healthy"
        elif connection_status == "connected":
            overall_status = "partial"
        else:
            overall_status = "error"
        
        response = {
            "status": overall_status,
            "service": "storage",
            "connection": connection_status,
            "endpoint": storage.endpoint,
            "buckets": buckets_status,
        }
        
        if connection_error:
            response["connection_error"] = connection_error
        
        # Add helpful messages
        if overall_status == "network_error":
            response["message"] = (
                "Network error (540) connecting to Supabase Storage. "
                "Check: 1) S3 credentials are correct, 2) Endpoint URL is valid, "
                "3) Network connectivity, 4) Supabase service is accessible"
            )
        elif overall_status == "partial":
            response["message"] = "Some buckets are missing. Create them in Supabase Dashboard > Storage"
        elif overall_status == "error":
            response["message"] = "Storage connection failed. Check configuration and credentials"
        
        return response
        
    except ValueError as e:
        return {
            "status": "not_configured",
            "error": str(e),
            "message": "S3 credentials not configured. Set S3_ACCESS_KEY_ID and S3_ACCESS_KEY_SECRET in .env",
            "help": "Get credentials from: Supabase Dashboard > Project Settings > Storage > S3 Access Keys",
        }
    except StorageError as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Storage client initialization failed",
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Unexpected error checking storage health",
        }





