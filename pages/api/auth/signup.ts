import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import bcrypt from 'bcrypt'
import { signToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({error: 'Email and password required'})
  
  const existing = await prisma.user.findUnique({ where: { email }})
  if (existing) return res.status(400).json({error: 'User exists'})
  
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, passwordHash, name }
  })
  
  const token = signToken({ userId: user.id })
  res.status(200).json({ token })
}
