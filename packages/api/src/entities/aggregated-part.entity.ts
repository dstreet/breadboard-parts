import { SupplierPackaging } from "./supplier-packaging.entity"

export interface AggregatedPart {
  name: string
  description: string
  totalStock: number
  manufacturerLeadTime: number
  manufacturerName: string
  packaging: SupplierPackaging[]
  productDoc: string
  productUrl: string
  productImageUrl: string
  specifications: Record<string, any> | []
  sourceParts: string[]
}