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

const SupplierName = 'Arrow'

@Injectable()
export class ArrowSupplierService implements Supplier {
  private readonly logger = new Logger(ArrowSupplierService.name)

  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService
  ) {}

  getName(): string {
    return SupplierName
  }

  async getPart(partNumber: string): Promise<Part> {
    this.logger.log("fetching parts from Arrow", { partNumber })

    const $obj = this.httpService
      .get<PartsResponse>(this.config.supplier.arrowEndpoint)


    let res: AxiosResponse<PartsResponse>

    try {
      res = await lastValueFrom($obj)
    } catch (err) {
      throw new SupplierFetchException(this.getName(), err.msg)
    }

    if (res.status === 404) {
      this.logger.warn("part not found at Arrow", { partNumber })
      throw new PartNotFoundException(partNumber)
    }

    // Not 2XX status codes
    if (res.status / 100 !== 2) {
      throw new SupplierFetchException(this.getName(), res.statusText)
    }

    const parts = res.data?.pricingResponse.filter(pr => pr.purchasable && pr.partNumber === partNumber)

    if (!parts.length) {
      this.logger.warn("part not found at Arrow", { partNumber })
      throw new PartNotFoundException(partNumber)
    }

    this.logger.debug(`found ${parts.length} packages from Arrow`, { partNumber })

    const description = parts[0].description
    const manufacturerName = parts[0].manufacturer

    let productDoc
    let productUrl
    let productImageUrl

    for (const url of parts[0].urlData) {
      switch (url.type) {
        case "Datasheet":
          productDoc = url.value
          break
        
        case "Image Small":
          productImageUrl = url.value
          break
        
        case "Part Details":
          productUrl = url.value
          break
      }
    }

    const packaging: Packaging[] = parts.map(part => ({
      type: part.pkg,
      minimumOrderQuantity: part.minOrderQuantity,
      quantityAvailable: parseInt(part.fohQuantity, 10),
      unitPrice: parseFloat(part.resalePrice),
      priceBreaks: part.pricingTier.map(tier => ({
        breakQuantity: parseInt(tier.minQuantity, 10),
        unitPrice: parseFloat(tier.resalePrice),
        totalPrice: parseFloat(tier.resalePrice) * parseInt(tier.minQuantity, 10)
      })),
      manufacturerLeadTime: part.leadTime.arrowLeadTime
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
}