import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getUserIdFromRequest } from '../../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return res.status(401).json({error: 'Not authenticated'})

  const { id } = req.query
  const itemId = Number(id)

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { wishlist: true }
  })
  if (!item) return res.status(404).json({error: 'Not found'})

  const isOwner = item.wishlist.userId === userId
  if (isOwner) {
    // Owner should not see chats
    return res.status(403).json({error: 'Forbidden for owner'})
  }

  if (req.method === 'GET') {
    const chats = await prisma.itemChat.findMany({ 
      where: { itemId }, 
      include: { user: true }, 
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json(chats)
  }

  if (req.method === 'POST') {
    const { message } = req.body
    if (!message) return res.status(400).json({error: 'Message required'})
    const chat = await prisma.itemChat.create({
      data: {
        itemId,
        userId,
        message
      }
    })
    return res.status(200).json(chat)
  }

  return res.status(405).end()
}
