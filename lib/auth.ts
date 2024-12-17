import jwt from 'jsonwebtoken'
import { NextApiRequest } from 'next'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET)
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET)
}

export function getUserIdFromRequest(req: NextApiRequest): number | null {
  const authHeader = req.headers.authorization
  if (!authHeader) return null
  const token = authHeader.split(' ')[1]
  if (!token) return null
  try {
    const decoded = verifyToken(token) as { userId: number }
    return decoded.userId
  } catch {
    return null
  }
}
