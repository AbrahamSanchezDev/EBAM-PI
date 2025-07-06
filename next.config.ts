import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/esp32',
        destination: 'http://192.168.2.185/', // Cambia por la IP de tu ESP32
      },
    ];
  },
};

export default nextConfig;
