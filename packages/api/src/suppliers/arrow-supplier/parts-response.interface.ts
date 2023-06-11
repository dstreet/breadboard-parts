export interface PartsResponse {
  pricingResponse: PricingResponse[]
}

interface PricingResponse {
  itemId: number
  warehouseId: number
  arrowReel: boolean
  responseState: string
  currency: string
  documentId: string
  resalePrice: string
  fohQuantity: string
  description: string
  partNumber: string
  minOrderQuantity: number
  multOrderQuantity: number
  manufacturer: string
  pkg: string
  spq: number,
  pricingTier: PriceTier[]
  urlData: UrlItem[]
  leadTime: LeadTime
  purchasable: boolean
}

interface PriceTier {
  minQuantity: string
  maxQuantity: string
  resalePrice: string
}

interface UrlItem {
  type: 'Image Small' | 'Image Large' | 'Datasheet' | 'Part Details'
  value: string
}

interface LeadTime {
  supplierLeadTime: number
  supplierLeadTimeDate: string
  arrowLeadTime: number
}