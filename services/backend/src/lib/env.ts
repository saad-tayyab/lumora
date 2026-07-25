import { appMeta as encoreAppMeta } from 'encore.dev';

export function isProduction(): boolean {
  return encoreAppMeta().environment.type === 'production';
}

export function isDevelopment(): boolean {
  return encoreAppMeta().environment.type === 'development';
}

export function isTest(): boolean {
  return encoreAppMeta().environment.type === 'test';
}

export function getCloudProvider(): string {
  return encoreAppMeta().environment.cloud;
}

export function getAppId(): string {
  return encoreAppMeta().appId;
}
