import { Injectable, Inject, Logger } from '@nestjs/common';
import type { Supplier } from './interfaces/supplier.interface';
import { AggregatedPart } from './entities/aggregated-part.entity';
import { Part } from './entities/part.entity';
import { PartNotFoundException } from './exceptions/part-not-found.exceptions';
import { Suppliers } from './constants/tokens';

type NonAggregatedPartProperty = keyof Omit<Part, 'packaging'>

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name)

  constructor(
    @Inject(Suppliers) private suppliers: Supplier[]
  ) {}

  async getAggregatePartFromSuppliers(partNumber: string): Promise<AggregatedPart> {
    this.logger.log(`aggretating part data from ${this.suppliers.length} suppliers`, { partNumber })

    const supplierResponses = await Promise.allSettled<Part>(
      this.suppliers.map(supplier => supplier.getPart(partNumber))
    )
    
    const supplierParts: Array<{part: Part, supplier: Supplier}> = []

    for (let i = 0; i < supplierResponses.length; i++) {
      const res = supplierResponses[i]
      const supplier = this.suppliers[i]

      if (res.status === 'rejected') {
        this.logger.warn(`supplier ${supplier.getName()} failed to get part`, { partNumber, reason: res.reason })
        continue
      }

      this.logger.debug(`supplier ${supplier.getName()} returned part`, { partNumber, part: res.value })
      supplierParts.push({
        part: res.value,
        supplier: this.suppliers[i]
      })
    }

    if (!supplierParts.length) {
      this.logger.warn('no suppliers returned part', { partNumber })
      throw new PartNotFoundException(partNumber)
    }

    const parts = supplierParts.map(sp => sp.part)
    const packages = supplierParts.flatMap(sp => sp.part.packaging.map(p => ({ ...p, supplier: sp.supplier.getName() })))
    const supplierNames = supplierParts.map(sp => sp.supplier.getName())
    const totalStock = packages.reduce((acc, p) => acc + p.quantityAvailable, 0)
    const manufacturerLeadTimes = packages.map(p => p.manufacturerLeadTime).filter(Boolean).sort()
    
    this.logger.debug(`received parts from ${supplierParts.length} suppliers`, { suppliers: supplierNames })

    return {
      name: this.getPartPropertyFromSuppliers<string>(parts, 'name', ''),
      description: this.getPartPropertyFromSuppliers<string>(parts, 'description', ''),
      manufacturerName: this.getPartPropertyFromSuppliers<string>(parts, 'manufacturerName', ''),
      productDoc: this.getPartPropertyFromSuppliers<string>(parts, 'productDoc', ''),
      productUrl: this.getPartPropertyFromSuppliers<string>(parts, 'productUrl', ''),
      productImageUrl: this.getPartPropertyFromSuppliers<string>(parts, 'productImageUrl', ''),
      specifications: this.getPartPropertyFromSuppliers<Record<string, any> | []>(parts, 'specifications', []),
      sourceParts: supplierNames,
      totalStock,
      manufacturerLeadTime: manufacturerLeadTimes[0],
      packaging: packages
    }
  }

  private getPartPropertyFromSuppliers<T>(parts: Part[], property: NonAggregatedPartProperty, defaultValue: T): T {
    for (const part of parts) {
      if (typeof part[property] !== undefined) {
        return part[property] as T
      }
    }

    return defaultValue
  }
}
