import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import bcrypt from 'bcrypt'
import { signToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({error: 'Email and password required'})
  
  const user = await prisma.user.findUnique({ where: { email }})
  if (!user) return res.status(400).json({error: 'Invalid credentials'})
  
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(400).json({error: 'Invalid credentials'})
  
  const token = signToken({ userId: user.id })
  res.status(200).json({ token })
}
