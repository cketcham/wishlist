import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserIdFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return res.status(401).json({error: 'Not authenticated'})

  const { id } = req.query
  const wishlistId = Number(id)

  const wishlist = await prisma.wishlist.findUnique({
    where: { id: wishlistId }
  })
  if (!wishlist) return res.status(404).json({error: 'Not found'})

  if (req.method === 'GET') {
    // We don't apply complex logic here, just return wishlist. Items are fetched separately or inline.
    return res.status(200).json(wishlist)
  }

  if (req.method === 'PUT') {
    if (wishlist.userId !== userId) return res.status(403).json({error: 'Forbidden'})
    const { title, description, defaultDay, defaultMonth } = req.body
    const updated = await prisma.wishlist.update({
      where: { id: wishlistId },
      data: { title, description, defaultDay, defaultMonth }
    })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    if (wishlist.userId !== userId) return res.status(403).json({error: 'Forbidden'})
    await prisma.wishlist.delete({ where: { id: wishlistId }})
    return res.status(204).end()
  }

  return res.status(405).end()
}
