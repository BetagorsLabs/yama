import React from 'react';
import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="/logo.svg"
      alt="Yama JS"
      width={20}
      height={20}
      style={{ flexShrink: 0, display: 'block' }}
      priority
    />
  );
}

