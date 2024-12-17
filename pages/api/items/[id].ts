import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserIdFromRequest } from '../../../lib/auth'

async function transformItemForOwner(item: any, userId: number) {
  // Get purchases
  const purchases = await prisma.purchase.findMany({ where: { itemId: item.id }})
  const isPurchased = purchases.length > 0
  const now = new Date()

  // If user is owner:
  const wishlist = await prisma.wishlist.findUnique({ where: { id: item.wishlistId }})
  const isOwner = wishlist?.userId === userId
  item.isOwner = isOwner

  if (isOwner && now < item.eventDate) {
      delete item.purchase
  }

  return item
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return res.status(401).json({error: 'Not authenticated'})

  const { id } = req.query
  const itemId = Number(id)

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      chats: {
        include: {
          user: true
        }
      },
      purchase: true
    }
  })
  if (!item) return res.status(404).json({error: 'Not found'})

  if (req.method === 'GET') {
    const transformed = await transformItemForOwner(item, userId)
    if (!transformed) return res.status(404).json({error: 'Not found (purchased and hidden)'})
    return res.status(200).json(transformed)
  }

  // Only the owner can update or delete
  const wishlist = await prisma.wishlist.findUnique({ where: { id: item.wishlistId }})
  if (!wishlist) return res.status(404).json({error: 'Not found'})
  const isOwner = wishlist.userId === userId

//   if (req.method === 'PUT') {
//     if (!isOwner) return res.status(403).json({error: 'Forbidden'})
//     const { name, description, price, image_url, event_date } = req.body
//     const updated = await prisma.item.update({
//       where: { id: itemId },
//       data: {
//         name,
//         description,
//         price,
//         imageUrl: image_url,
//         eventDate: event_date ? new Date(event_date) : item.eventDate
//       }
//     })
//     return res.status(200).json(updated)
//   }

  if (req.method === 'DELETE') {
    if (!isOwner) return res.status(403).json({error: 'Forbidden'})
    await prisma.item.delete({ where: { id: itemId }})
    return res.status(204).end()
  }

  return res.status(405).end()
}
