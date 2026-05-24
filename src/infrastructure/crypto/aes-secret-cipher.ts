import type { SecretCipherPort } from '@/application/api-keys/ports/secret-cipher.port';
import { decrypt, deriveEncryptionKey, encrypt } from '@/utils/encryption';

export class AesSecretCipher implements SecretCipherPort {
  private readonly key: Buffer;

  constructor(secret: string) {
    this.key = deriveEncryptionKey(secret);
  }

  encrypt(plain: string): string {
    return encrypt(plain, this.key);
  }

  decrypt(cipherText: string): string {
    return decrypt(cipherText, this.key);
  }
}
