export interface SecretCipherPort {
  encrypt(plain: string): string;
  decrypt(cipherText: string): string;
}
