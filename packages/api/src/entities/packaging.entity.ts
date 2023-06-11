import { PriceBreak } from "./price-break.entity"

export interface Packaging {
  type: string
  minimumOrderQuantity: number
  quantityAvailable: number
  unitPrice: number
  priceBreaks: PriceBreak[]
  manufacturerLeadTime?: number
}