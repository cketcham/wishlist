import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserIdFromRequest } from '../../../lib/auth'
import { scrapeUrl } from '../../../lib/metascraper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return res.status(401).json({error: 'Not authenticated'})

  if (req.method === 'POST') {
    const { wishlistId, url, name, description, price, image_url, event_date } = req.body
    // Check if user owns the wishlist
    const wishlist = await prisma.wishlist.findUnique({ where: { id: wishlistId }})
    if (!wishlist) return res.status(404).json({error: 'Wishlist not found'})
    if (wishlist.userId !== userId) return res.status(403).json({error: 'Forbidden'})

    let scrapedData = {title: null, description: null, image: null}
    if (url) {
      scrapedData = await scrapeUrl(url)
    }

    const finalName = name || scrapedData.title || 'Unnamed Item'
    const finalDescription = description || scrapedData.description || ''
    const finalImage = image_url || scrapedData.image || ''
    let finalPrice = price ? Number(price) : null
    // If no date given, use wishlist defaults:
    let finalDate: Date
    if (event_date) {
      finalDate = new Date(event_date)
    } else if (wishlist.defaultDay && wishlist.defaultMonth) {
      const now = new Date()
      finalDate = new Date(now.getFullYear(), wishlist.defaultMonth - 1, wishlist.defaultDay)
    } else {
      // fallback to some default, e.g. one month from now
      const now = new Date()
      finalDate = new Date(now.getFullYear(), now.getMonth()+1, now.getDate())
    }

    const item = await prisma.item.create({
      data: {
        wishlistId,
        name: finalName,
        description: finalDescription,
        price: finalPrice,
        imageUrl: finalImage,
        eventDate: finalDate
      }
    })
    return res.status(200).json(item)
  }

  return res.status(405).end()
}
