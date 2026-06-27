import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './auth.schema.js'

describe('registerSchema', () => {
  it('accepts valid email and password', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
    })

    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: '123',
    })

    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts valid credentials payload', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'any',
    })

    expect(result.success).toBe(true)
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })

    expect(result.success).toBe(false)
  })
})
