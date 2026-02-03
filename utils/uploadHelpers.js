import { getPresignedUrl, uploadToObjectStorage, confirmUpload } from '../api/test';

/**
 * Transfer HTML from Editor to file and upload to Storage
 * Used for both Writing (description) and Speaking (description)
 */
export const uploadHtmlContent = async (htmlString, testId, token) => {
  if (!htmlString || htmlString === '<p></p>') return null;

  // 1. create File object từ HTML string
  const filename = `description.html`;
  const file = new File([htmlString], filename, { type: 'text/html' });

  try {
    // 2. get Presigned URL
    const presign = await getPresignedUrl(
      {
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        category: 'tests',
        testId,
        part: 1,
      },
      token,
    );

    // 3. upload to S3/Object Storage
    const { etag } = await uploadToObjectStorage({
      url: presign.url,
      mimeType: file.type,
      file: file,
    });

    // 4. Confirm with Backend to get public access URL
    const confirm = await confirmUpload(
      {
        key: presign.key,
        fileSize: file.size,
        mimeType: file.type,
        etag: etag,
      },
      token,
    );

    return confirm.file_url; // Return https://.../description.html
  } catch (error) {
    console.error('Upload HTML content failed:', error);
    throw error;
  }
};

/**
 * Upload physical files to Object Storage and return their URLs
 * Used for audio/image files in test
 */
export const uploadMediaFile = async (file, testId, token) => {
  if (!file) return null;

  const presign = await getPresignedUrl(
    {
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      category: 'tests',
      testId,
      part: 1,
    },
    token,
  );

  const { etag } = await uploadToObjectStorage({
    url: presign.url,
    mimeType: file.type,
    file: file,
  });

  const confirm = await confirmUpload(
    {
      key: presign.key,
      fileSize: file.size,
      mimeType: file.type,
      etag: etag,
    },
    token,
  );

  return confirm.file_url;
};
