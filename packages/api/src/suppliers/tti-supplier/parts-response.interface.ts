export interface PartsResponse {
  parts: Part[]
}

interface Part {
  ttiPartNumber: string
  manufacturerPartNumber: string
  manufacturerCode: string
  manufacturer: string
  salesMinimum: number
  salesMultiple: number
  partSearchId: string
  availableToSell: number
  buyUrl: string
  datasheetURL: string
  description: string
  pricing: Pricing
  packaging: string
  leadTime: string
  partNCNR: string
  hts: string
  category: string
  imageURL: string
  exportInformation: ExportInfo
  environmentalInformation: EnvironmentInfo
  roHsStatus: string
}

interface Pricing {
  vipPrice: string
  quantityPriceBreaks: PriceBreak[]
}

interface PriceBreak {
  quantity: number
  price: string
}

interface ExportInfo {
  eccn: string
  htts: string
}

interface EnvironmentInfo {
  rohsStatus: string
  leadInTerminals: string
  reachSVHC: string
  reachSubstanceName: string
}