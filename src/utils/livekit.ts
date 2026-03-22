
// Утилита для загрузки на S3 с прогрессом
export const uploadToS3 = async (
  file: File,
  url: string,
  fields: Record<string, string>,
  onProgress?: (progress: number) => void
): Promise<void> => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded * 100) / e.total);
          onProgress(progress);
        }
      });
    }
    
    xhr.open("POST", url);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
};

// Подключение к LiveKit WebSocket
export const connectToLiveKit = async (
  wsUrl: string,
  token: string,
  roomName: string = "main-broadcast"
): Promise<WebSocket> => {
  const params = new URLSearchParams({
    token,
    room: roomName,
  });
  const fullUrl = `${wsUrl}/rtc?${params}`;
  
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(fullUrl);
    ws.onopen = () => resolve(ws);
    ws.onerror = (err) => reject(err);
  });
};