import 'dotenv/config'

process.env.DATABASE_URL ??= 'postgres://postgres:postgres@localhost:5432/nfe'
process.env.JWT_SECRET ??= 'test-secret-key-min-8-chars'
process.env.JWT_EXPIRES_IN ??= '7d'
