{
  "id": "",
  "lang": "typescript",
  "secrets": {
    "DATABASE_URL": { "description": "PostgreSQL connection string", "required": true },
    "BETTER_AUTH_SECRET": { "description": "Auth secret key", "required": true },
    "BETTER_AUTH_URL": { "description": "Auth base URL", "required": false }
  },
  "build": {
    "hooks": {
      "prebuild": "npx turbo run build --filter=@lumora/backend^..."
    }
  }
}
