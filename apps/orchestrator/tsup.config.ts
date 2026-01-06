import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  format: ['cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: [
    // NestJS microservices optional transports we don't use but that are conditionally required
    '@nestjs/websockets/socket-module',
    'mqtt',
    'nats',
    'kafkajs',
    '@grpc/grpc-js',
    '@grpc/proto-loader',
  ],
});
