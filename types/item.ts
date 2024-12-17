// types/item.ts
import { Item, Purchase, ItemChat } from '@prisma/client'

export type ItemWithOwnership = Item & {
  isOwner: boolean;
  purchase: Purchase | null;
  chats: ItemChat[]
}