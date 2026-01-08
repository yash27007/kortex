# Storage Upload Troubleshooting Guide

## Error 540: Upload Failed

Error 540 is a network/timeout error when uploading to Supabase Storage. Here's how to fix it:

### 1. Check Supabase Storage Configuration

Verify your `.env` file has the correct S3 credentials:

```bash
# Required for Supabase Storage
S3_ACCESS_KEY_ID=your_access_key_id
S3_ACCESS_KEY_SECRET=your_access_key_secret
S3_ENDPOINT=https://your_project_ref.supabase.co/storage/v1/s3
S3_REGION=us-east-1

# Bucket names (must exist in Supabase)
STORAGE_BUCKET_PDFS=pdfs
STORAGE_BUCKET_VIDEOS=videos
STORAGE_BUCKET_ASSETS=assets
```

### 2. Get S3 Credentials from Supabase

1. Go to Supabase Dashboard
2. Select your project
3. Go to **Project Settings** > **Storage** > **S3 Access Keys**
4. Generate new keys if needed
5. Copy the **Access Key ID** and **Secret Access Key**
6. The endpoint format is: `https://[project_ref].supabase.co/storage/v1/s3`

### 3. Create Required Buckets

The buckets must exist in Supabase Storage:

1. Go to **Storage** in Supabase Dashboard
2. Create these buckets if they don't exist:
   - `pdfs` (for PDF uploads)
   - `videos` (for video files)
   - `assets` (for general assets)
3. Set bucket policies:
   - **Public buckets**: Allow public read access
   - **Private buckets**: Use signed URLs (configure RLS policies)

### 4. Check Bucket Permissions

For the `pdfs` bucket:
- **Public**: If you want direct URL access
- **Private**: If you want to use signed URLs (recommended for security)

### 5. Verify Storage Health

Check if storage is configured correctly:

```bash
curl http://localhost:8000/storage/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "storage",
  "connection": "connected",
  "buckets": {
    "pdfs": {"exists": true, "name": "pdfs"},
    "videos": {"exists": true, "name": "videos"},
    "assets": {"exists": true, "name": "assets"}
  }
}
```

### 6. Common Issues

#### Issue: "Bucket does not exist"
**Solution**: Create the bucket in Supabase Dashboard > Storage

#### Issue: "Access denied"
**Solution**: 
- Check S3 credentials are correct
- Verify bucket permissions in Supabase
- Ensure RLS policies allow uploads (if using private buckets)

#### Issue: "Invalid access key"
**Solution**: 
- Regenerate S3 keys in Supabase Dashboard
- Update `.env` file with new credentials
- Restart the FastAPI server

#### Issue: Error 540 (Network/Timeout)
**Solution**:
- Check network connectivity
- Verify Supabase endpoint URL is correct
- Check if file size exceeds limits (50MB max)
- Try uploading a smaller file to test

### 7. Test Upload Manually

Test the storage endpoint directly:

```bash
# Test upload
curl -X POST http://localhost:8000/storage/upload/pdfs \
  -F "file=@test.pdf" \
  -F "bucket=pdfs"
```

### 8. Debug Steps

1. **Check FastAPI logs** for detailed error messages
2. **Check browser console** for upload errors
3. **Verify Supabase Dashboard** shows the bucket exists
4. **Test with a small file** first (e.g., 1MB PDF)
5. **Check network tab** in browser DevTools for request/response

### 9. Alternative: Use Supabase Storage API Directly

If S3 API continues to fail, you can use Supabase Storage REST API:

```python
# Alternative approach using Supabase Storage REST API
# This requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

But the S3 API is recommended for better compatibility and features.

### 10. Environment Variables Checklist

Make sure these are set in your `.env` file:

```bash
# Supabase Storage (S3 API)
S3_ACCESS_KEY_ID=...
S3_ACCESS_KEY_SECRET=...
S3_ENDPOINT=https://[project_ref].supabase.co/storage/v1/s3
S3_REGION=us-east-1

# Bucket names
STORAGE_BUCKET_PDFS=pdfs
STORAGE_BUCKET_VIDEOS=videos
STORAGE_BUCKET_ASSETS=assets
```

### Need Help?

If issues persist:
1. Check FastAPI server logs: `docker compose logs core` (if using Docker)
2. Check Supabase Dashboard for bucket status
3. Test with Supabase Storage UI to verify credentials work
4. Review error messages in browser console and FastAPI logs
