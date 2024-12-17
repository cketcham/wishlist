import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserIdFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return res.status(401).json({error: 'Not authenticated'})

  if (req.method === 'GET') {
    // Get wishlists for the current user
    const wishlists = await prisma.wishlist.findMany({
      where: { userId }
    })
    return res.status(200).json(wishlists)
  }

  if (req.method === 'POST') {
    const { title, description, defaultDay, defaultMonth } = req.body
    const wl = await prisma.wishlist.create({
      data: {
        userId,
        title,
        description,
        defaultDay,
        defaultMonth
      }
    })
    return res.status(200).json(wl)
  }

  return res.status(405).end()
}
