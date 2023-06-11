import { Packaging } from "./packaging.entity"

export interface Part {
    name?: string
    description?: string
    packaging: Packaging[]
    productDoc?: string
    productUrl?: string
    productImageUrl?: string
    specifications?: Record<string, any>,
    manufacturerName?: string
  }