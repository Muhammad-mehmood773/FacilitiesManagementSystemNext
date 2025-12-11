export async function decryptLoginId(encryptedBase64: string): Promise<string> {
  const passphrase = 'YourStrongEncryptionKey123!!@@';
  const salt = new TextEncoder().encode('Salt1234');
  const iterations = 1000;
  const keyLength = 256;
  const ivLength = 16;

  const decoded = decodeURIComponent(encryptedBase64);
  const encryptedBytes = Uint8Array.from(atob(decoded), (c) => c.charCodeAt(0));

  const baseKeyForKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const baseKeyForBits = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-1' },
    baseKeyForKey,
    { name: 'AES-CBC', length: keyLength },
    false,
    ['decrypt']
  );

  const fullKeyBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-1' },
    baseKeyForBits,
    keyLength + ivLength * 8
  );

  const fullKeyBytes = new Uint8Array(fullKeyBits);
  const iv = fullKeyBytes.slice(32, 48);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, aesKey, encryptedBytes);

  return new TextDecoder().decode(decrypted);
}
