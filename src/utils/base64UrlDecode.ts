export function base64UrlDecode(str: string): string {
  if (!str) {
    console.error("Empty string provided to base64UrlDecode");
    return "";
  }
  
  try {
    // Преобразуем base64url в обычный base64
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    
    // Добавляем паддинг
    const pad = base64.length % 4;
    if (pad) {
      base64 += "=".repeat(4 - pad);
    }
    
    // Декодируем base64 в бинарные данные
    const binaryString = atob(base64);
    
    // Преобразуем бинарную строку в Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Декодируем UTF-8
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.error("Error in base64UrlDecode:", e);
    console.error("Input string:", str);
    return "";
  }
}