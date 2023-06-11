import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { Part } from "../../entities/part.entity";
import { Supplier } from "../../interfaces/supplier.interface";
import { lastValueFrom } from 'rxjs'
import { PartsResponse } from "./parts-response.interface";
import { PartNotFoundException } from "../../exceptions/part-not-found.exceptions";
import { SupplierFetchException } from "../../exceptions/supplier-fetch.exceptions";
import { AxiosResponse } from "axios";
import { Packaging } from "../../entities/packaging.entity";
import { ConfigService } from "../../config/config.service";

const SupplierName = 'TTI'

@Injectable()
export class TTISupplierService implements Supplier {
  private readonly logger = new Logger(TTISupplierService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService
  ) {}

  getName(): string {
    return SupplierName
  }

  async getPart(partNumber: string): Promise<Part> {
    this.logger.log("fetching parts from TTI", { partNumber })

    const $obj = this.httpService
      .get<PartsResponse>(this.config.supplier.ttiEndpoint)


    let res: AxiosResponse<PartsResponse>

    try {
      res = await lastValueFrom($obj)
    } catch (err) {
      throw new SupplierFetchException(this.getName(), err.msg)
    }

    if (res.status === 404 || !res.data.parts.length) {
      this.logger.warn("part not found at TTI", { partNumber })
      throw new PartNotFoundException(partNumber)
    }

    // Not 2XX status codes
    if (res.status / 100 !== 2) {
      throw new SupplierFetchException(this.getName(), res.statusText)
    }

    const parts = res.data.parts.filter(p => p.manufacturerPartNumber === partNumber)

    this.logger.debug(`found ${parts.length} packages from TTI`, { partNumber })

    const description = parts[0].description
    const productDoc = parts[0].datasheetURL
    const productUrl = parts[0].buyUrl
    const productImageUrl = parts[0].imageURL
    const manufacturerName = parts[0].manufacturer

    const packaging: Packaging[] = parts.map(part => ({
      type: part.packaging,
      minimumOrderQuantity: part.salesMinimum,
      quantityAvailable: part.availableToSell,
      unitPrice: parseFloat(part.pricing.vipPrice),
      priceBreaks: part.pricing.quantityPriceBreaks.map(qpb => ({
        breakQuantity: qpb.quantity,
        unitPrice: parseFloat(qpb.price),
        totalPrice: parseFloat(qpb.price) * qpb.quantity
      })),
      manufacturerLeadTime: this.parseLeadTime(part.leadTime)
    }))

    return {
      description,
      packaging,
      productDoc,
      productUrl,
      productImageUrl,
      manufacturerName
    }
  }

  private parseLeadTime(leadTime: string): number {
    const weeks = leadTime.replace(/weeks/i, '').trim()
    return parseInt(weeks, 10) * 7
  }
}