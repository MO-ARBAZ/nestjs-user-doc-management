export default () => ({
  port: Number.parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "document_management",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  python: {
    host: process.env.PYTHON_SERVICE_HOST || "localhost",
    port: Number.parseInt(process.env.PYTHON_SERVICE_PORT, 10) || 3001,
  },
  webhook: {
    key: process.env.WEBHOOK_KEY || "your-webhook-key",
  },
})

