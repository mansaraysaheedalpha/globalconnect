# Image Upload Backend Requirements

## Overview
The frontend uses a temporary image upload flow that requires the backend to provide pre-signed S3 URLs for secure direct uploads.

## Endpoint Required

### POST `/api/v1/organizations/{org_id}/temp-image-upload`

**Purpose**: Generate a pre-signed URL for uploading images directly to S3.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "content_type": "image/jpeg",  // image/jpeg, image/png, image/webp
  "filename": "event-banner.jpg"
}
```

**Response** (200 OK):
```json
{
  "url": "https://your-bucket.s3.amazonaws.com/",
  "fields": {
    "key": "temp/org-id/uuid-filename.jpg",
    "AWSAccessKeyId": "...",
    "policy": "...",
    "signature": "...",
    "Content-Type": "image/jpeg"
  },
  "s3_key": "temp/org-id/uuid-filename.jpg",
  "public_url": "https://your-cdn.com/temp/org-id/uuid-filename.jpg"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid content type or filename
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User not member of organization
- `413 Payload Too Large`: File exceeds size limit

## Implementation Details

### 1. S3 Configuration
```python
import boto3
from botocore.config import Config
import uuid

s3_client = boto3.client(
    's3',
    region_name=AWS_REGION,
    config=Config(signature_version='s3v4')
)

BUCKET_NAME = "your-event-images-bucket"
CDN_URL = "https://your-cdn.com"  # Or S3 public URL
```

### 2. Generate Pre-signed POST URL
```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import uuid

router = APIRouter()

class TempImageUploadRequest(BaseModel):
    content_type: str
    filename: str

class TempImageUploadResponse(BaseModel):
    url: str
    fields: dict
    s3_key: str
    public_url: str

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/organizations/{org_id}/temp-image-upload")
async def create_temp_image_upload(
    org_id: str,
    request: TempImageUploadRequest,
    current_user = Depends(get_current_user)
):
    # Validate content type
    if request.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(400, "Invalid content type")

    # Validate user is member of org
    if not await is_user_member_of_org(current_user.id, org_id):
        raise HTTPException(403, "Not a member of this organization")

    # Generate unique S3 key
    file_ext = request.filename.split('.')[-1] if '.' in request.filename else 'jpg'
    s3_key = f"temp/{org_id}/{uuid.uuid4()}.{file_ext}"

    # Generate pre-signed POST
    presigned = s3_client.generate_presigned_post(
        Bucket=BUCKET_NAME,
        Key=s3_key,
        Fields={
            "Content-Type": request.content_type
        },
        Conditions=[
            {"Content-Type": request.content_type},
            ["content-length-range", 1, MAX_FILE_SIZE]
        ],
        ExpiresIn=300  # 5 minutes
    )

    return TempImageUploadResponse(
        url=presigned["url"],
        fields=presigned["fields"],
        s3_key=s3_key,
        public_url=f"{CDN_URL}/{s3_key}"
    )
```

### 3. S3 Bucket Policy (CORS)
```json
{
  "CORSConfiguration": {
    "CORSRules": [
      {
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "AllowedMethods": ["POST", "GET"],
        "AllowedHeaders": ["*"],
        "MaxAgeSeconds": 3000
      }
    ]
  }
}
```

### 4. S3 Bucket Policy (Public Read for temp/)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadTemp",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/temp/*"
    }
  ]
}
```

## Flow

1. **Frontend** calls `POST /temp-image-upload` with content type and filename
2. **Backend** validates request, generates pre-signed POST URL
3. **Backend** returns URL, fields, s3_key, and public_url
4. **Frontend** uploads file directly to S3 using the pre-signed POST
5. **Frontend** uses `public_url` as the image URL in the event creation form
6. When event is created, the image URL is stored in the database

## Optional: Image Processing

For production, consider:
- Moving images from `temp/` to `events/` after event creation
- Image resizing/optimization via Lambda trigger
- Cleanup job for unused temp images (older than 24h)

## Frontend Hook Location

The frontend hook that calls this endpoint is at:
`src/hooks/use-temp-image-upload.ts`

It expects exactly the response format documented above.
