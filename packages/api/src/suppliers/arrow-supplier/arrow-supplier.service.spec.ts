import { Test } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { HttpService } from '@nestjs/axios'
import { of } from 'rxjs'
import { ArrowSupplierService } from "./arrow-supplier.service"
import { AxiosResponse } from 'axios'
import { PartNotFoundException } from '../../exceptions/part-not-found.exceptions'
import { PartsResponse } from './parts-response.interface'
import { ConfigService } from '../../config/config.service'

describe('ArrowSupplierService', () => {
  let service: ArrowSupplierService
  let httpService: HttpService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ArrowSupplierService, ConfigService, HttpService]
    })
    .overrideProvider(ConfigService)
    .useValue({
      supplier: {
        arrowEndpoint: faker.internet.url()
      }
    })
    .overrideProvider(HttpService)
    .useValue({
      get: jest.fn()
    })
    .compile()

    service = module.get(ArrowSupplierService)
    httpService = module.get(HttpService)
  })

  describe('getPart', () => {
    it('should throw PartNotFoundException when API returns a 404', async () => {
      const partNumber = '1002'

      const res = of({
        status: 404
      } as unknown as AxiosResponse)

      jest.spyOn(httpService, 'get').mockReturnValue(res)

      await expect(service.getPart(partNumber)).rejects.toThrowError(PartNotFoundException)
    })

    it('should throw PartNotFoundException when no purchasable parts are returned', async () => {
      const partNumber = '1002'

      const res = of({
        status: 200,
        data: {
          pricingResponse: [{
            purchasable: false
          }]
        }
      } as unknown as AxiosResponse)

      jest.spyOn(httpService, 'get').mockReturnValue(res)

      await expect(service.getPart(partNumber)).rejects.toThrowError(PartNotFoundException)
    })

    it('should return the part data', async () => {
      const partNumber = '1002'

      const imgUrl = faker.internet.url()
      const datasheetUrl = faker.internet.url()
      const partDetailsUrl = faker.internet.url()

      const resData: PartsResponse = {
        pricingResponse: [{
          itemId: faker.number.int(),
          warehouseId: faker.number.int(),
          arrowReel: true,
          responseState: faker.word.adjective(),
          currency: faker.finance.currencyCode(),
          documentId: faker.string.alphanumeric(),
          resalePrice: faker.number.float().toString(),
          fohQuantity: faker.number.int().toString(),
          description: faker.word.words(),
          partNumber,
          minOrderQuantity: faker.number.int(),
          multOrderQuantity: faker.number.int(),
          manufacturer: faker.company.name(),
          pkg: faker.word.noun(),
          spq: faker.number.int(),
          purchasable: true,
          pricingTier: [{
            minQuantity: "1",
            maxQuantity: "100",
            resalePrice: faker.number.float().toString()
          }],
          urlData: [
            {
              type: 'Image Small',
              value: imgUrl
            },
            {
              type: 'Datasheet',
              value: datasheetUrl
            },
            {
              type: 'Part Details',
              value: partDetailsUrl
            }
          ],
          leadTime: {
            supplierLeadTime: faker.number.int(),
            supplierLeadTimeDate: faker.date.future().toString(),
            arrowLeadTime: faker.number.int()
          }
        }]
      }

      const res = of({
        status: 200,
        data: resData
      } as unknown as AxiosResponse)

      jest.spyOn(httpService, 'get').mockReturnValue(res)

      await expect(service.getPart(partNumber)).resolves.toEqual({
        description: resData.pricingResponse[0].description,
        productDoc: datasheetUrl,
        productUrl: partDetailsUrl,
        productImageUrl: imgUrl,
        manufacturerName: resData.pricingResponse[0].manufacturer,
        packaging: resData.pricingResponse.map(part => ({
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
      })
    })
  })
})