import { Part } from "src/entities/part.entity"

export interface Supplier {
    getName(): string
    getPart(partNumber: string): Promise<Part>
}

export const Supplier = Symbol("SupplierInterface")