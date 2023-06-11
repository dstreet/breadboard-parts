import { Packaging } from "./packaging.entity"

export interface SupplierPackaging extends Packaging {
  supplier: string
}