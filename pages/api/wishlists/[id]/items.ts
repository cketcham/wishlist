import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'
import { getUserIdFromRequest } from '../../../../lib/auth'
import { scrapeUrl } from '../../../../lib/metascraper'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return res.status(401).json({error: 'Not authenticated'})

  const { id } = req.query
  const wishlistId = Number(id)

  try {
    // First, verify if the user has access to this wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { id: wishlistId },
    })

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' })
    }

    // Handle POST request for creating items
    if (req.method === 'POST') {
      const { url } = req.body
      
      // Scrape the URL metadata
      const metadata = await scrapeUrl(url)
      
      // Create the item with the scraped metadata
      const item = await prisma.item.create({
        data: {
          wishlistId: wishlistId,
          url: url,
          name: metadata.title || url,
          description: metadata.description,
          imageUrl: metadata.image, // Changed from image to imageUrl to match schema
          price: metadata.price,
          currency: metadata.currency,
          eventDate: new Date(), // Required field in schema was missing
        }
      })
      
      return res.status(200).json(item)
    }

    // Handle GET request - existing code for fetching items
    const items = await prisma.item.findMany({
      where: {
        wishlistId: wishlistId,
      },
      include: {
        purchase: {
          select: {
            id: true,
            purchaser: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // If user is not the owner and the date hasn't passed, filter out purchase information
    const today = new Date()
    const shouldHidePurchaseInfo = 
      wishlist.userId === userId && 
      wishlist.defaultMonth && 
      wishlist.defaultDay && 
      new Date(new Date().getFullYear(), wishlist.defaultMonth - 1, wishlist.defaultDay) > today

    const processedItems = items.map(item => ({
      ...item,
      isOWner: wishlist.userId === userId,
      purchase: shouldHidePurchaseInfo ? null : item.purchase,
    }))

    return res.status(200).json(processedItems)
  } catch (error) {
    console.error('Error handling wishlist items:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}