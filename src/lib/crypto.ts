// 密碼加密工具 - 使用 Web Crypto API (SHA-256)

/**
 * 將密碼轉換為 SHA-256 hash
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * 驗證密碼是否匹配
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * 檢查字串是否為 hash 格式（64 位 hex）
 */
export function isPasswordHashed(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}
