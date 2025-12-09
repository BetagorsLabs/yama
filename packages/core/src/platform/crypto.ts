export interface CryptoProvider {
  randomBytes(length: number): Uint8Array;
  randomInt(min: number, max: number): number;
  timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean;
}

export interface PasswordHasher {
  hash(password: string, saltRounds?: number): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

let cryptoProvider: CryptoProvider | null = detectWebCryptoProvider();
let passwordHasher: PasswordHasher | null = null;

export function setCryptoProvider(provider: CryptoProvider | null): void {
  cryptoProvider = provider;
}

export function setPasswordHasher(hasher: PasswordHasher | null): void {
  passwordHasher = hasher;
}

export function getCryptoProvider(): CryptoProvider {
  const provider = cryptoProvider ?? detectWebCryptoProvider();
  if (!provider) {
    throw new Error(
      "Crypto provider not configured for @betagors/yama-core. Supply one via setCryptoProvider (e.g., from @betagors/yama-node or a Web Crypto host)."
    );
  }
  cryptoProvider = provider;
  return provider;
}

export async function getPasswordHasher(): Promise<PasswordHasher> {
  if (passwordHasher) {
    return passwordHasher;
  }
  passwordHasher = await createBcryptPasswordHasher();
  return passwordHasher;
}

function detectWebCryptoProvider(): CryptoProvider | null {
  const crypto = globalThis.crypto;
  if (!crypto || typeof crypto.getRandomValues !== "function") {
    return null;
  }

  return {
    randomBytes: (length: number): Uint8Array => {
      const buf = new Uint8Array(length);
      crypto.getRandomValues(buf);
      return buf;
    },
    randomInt: (min: number, max: number): number => {
      if (!Number.isInteger(min) || !Number.isInteger(max) || max <= min) {
        throw new Error("randomInt expects integer min < max");
      }
      const range = max - min;
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return min + (buf[0] % range);
    },
    timingSafeEqual: (a: Uint8Array, b: Uint8Array): boolean => {
      if (a.length !== b.length) {
        return false;
      }
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
      }
      return result === 0;
    },
  };
}

async function createBcryptPasswordHasher(): Promise<PasswordHasher> {
  try {
    const bcrypt = await import("bcryptjs");
    return {
      hash: (password: string, saltRounds = 12) => bcrypt.hash(password, saltRounds),
      verify: (password: string, hash: string) => bcrypt.compare(password, hash),
    };
  } catch (error) {
    throw new Error(
      "Password hashing requires bcryptjs. Provide a password hasher via setPasswordHasher() or install bcryptjs in your runtime."
    );
  }
}

