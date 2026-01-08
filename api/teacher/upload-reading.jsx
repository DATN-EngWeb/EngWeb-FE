/* eslint-env browser */
/* global fetch, FormData, Blob */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required but not set in .env');
}

// Định nghĩa Base URL cho phần Tests (tương tự như ACCOUNTS_BASE_URL)
const TESTS_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/api/tests`;

// Hàm xử lý response chung (Copy từ mẫu của bạn để đảm bảo đồng bộ cách bắt lỗi)
async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (response.ok) {
    return data ?? {};
  }

  // Tạo object lỗi chi tiết
  const error = new Error();
  error.message =
    data?.message ||
    data?.detail ||
    data?.error ||
    data?.errors ||
    Object.values(data || {})?.[0]?.[0] ||
    'Something went wrong';
  error.data = data;
  error.status = response.status;

  throw error;
}

// Hàm createNewTest viết lại theo phong cách fetch và handleResponse
// Lưu ý: accessToken được truyền vào tham số (giống hàm logout ở mẫu)
export async function createNewTest(testData, accessToken) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${TESTS_BASE_URL}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(testData),
    cache: 'no-store',
  });

  return handleResponse(response);
}

// Hàm upload nội dung Reading Test (Parts)
// Endpoint: /api/tests/receptive/{test_id}/
export async function uploadReadingTestContent(testId, partsData, accessToken) {
  // 1. Cấu hình Headers cho JSON
  const headers = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // 2. Bọc dữ liệu đúng theo Schema: { "data": { "parts": [...] } }
  // Dữ liệu này khớp với khung màu đen trong ảnh Swagger của bạn
  const bodyPayload = {
    data: {
      parts: partsData,
    },
  };

  // 3. Thực hiện gọi API
  const response = await fetch(`${TESTS_BASE_URL}/receptive/${testId}/`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(bodyPayload),
    cache: 'no-store',
  });

  return handleResponse(response);
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadReadingTestInChunks(testId, partsData, accessToken) {
  // Chuyển đổi dữ liệu JSON thành Binary (Blob)
  // Lưu ý: Lúc này chưa có ảnh, chỉ có text JSON thuần túy
  // Nếu có ảnh, cần xử lý khác
  const jsonBody = JSON.stringify({
    parts: partsData,
  });

  // Tạo Blob từ chuỗi JSON (đây chính là cục Binary bạn cần)
  const fullPayloadBlob = new Blob([jsonBody], { type: 'application/json' });

  // Tính toán số lượng chunks
  const totalSize = fullPayloadBlob.size;
  const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
  const uploadId = `${Date.now()}_test_${testId}`;

  //   console.log(`Tổng dung lượng JSON: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  //   console.log(`Chia thành: ${totalChunks} chunks`);

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    // Tính vị trí cắt
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);

    // Cắt Blob (thao tác này rất nhẹ, không tốn RAM)
    const chunkBlob = fullPayloadBlob.slice(start, end);

    // Đóng gói vào FormData
    const formData = new FormData();
    formData.append('chunk', chunkBlob); // Mảnh dữ liệu
    formData.append('chunkIndex', chunkIndex); // Thứ tự mảnh (0, 1, 2...)
    formData.append('totalChunks', totalChunks); // Tổng số mảnh
    formData.append('uploadId', uploadId); // ID phiên upload
    formData.append('testId', testId); // ID bài test

    // Chuẩn bị Header
    const headers = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    // e. Gọi API (Tuần tự - Await để xong mảnh này mới gửi mảnh kia)
    // Lưu ý: Endpoint này Server phải viết logic để nhận chunk và ghép lại
    const response = await fetch(`${TESTS_BASE_URL}/reading/${testId}/chunk-upload`, {
      method: 'POST',
      headers,
      body: formData,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Upload failed at chunk ${chunkIndex + 1}`);
    }

    console.log(`Đã gửi thành công chunk ${chunkIndex + 1}/${totalChunks}`);
  }

  return true;
}
