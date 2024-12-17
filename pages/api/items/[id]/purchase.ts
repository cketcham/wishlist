import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getUserIdFromRequest } from '../../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return res.status(401).json({error: 'Not authenticated'})

  const { id } = req.query
  const itemId = Number(id)

  if (req.method === 'POST') {
    // Mark as purchased by current user
    // Check if already purchased
    const existing = await prisma.purchase.findFirst({ where: { itemId }})
    if (existing) return res.status(400).json({error: 'Already purchased'})

    const purchase = await prisma.purchase.create({
      data: {
        itemId,
        purchaserUserId: userId
      }
    })
    return res.status(200).json(purchase)
  }

  return res.status(405).end()
}
