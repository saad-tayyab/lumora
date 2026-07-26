import { Gateway } from 'encore.dev/api';
import { auth } from './auth';

export const gw = new Gateway({
  authHandler: auth,
  cors: {
    allowOrigins: ['http://localhost:3000'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposeHeaders: ['Set-Cookie'],
    allowCredentials: true,
  },
});
