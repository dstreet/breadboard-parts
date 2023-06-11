import { Test } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { HttpService } from '@nestjs/axios'
import { of } from 'rxjs'
import { TTISupplierService } from "./tti-supplier.service"
import { AxiosResponse } from 'axios'
import { PartNotFoundException } from '../../exceptions/part-not-found.exceptions'
import { ConfigService } from '../../config/config.service'

describe('ArrowSupplierService', () => {
  let service: TTISupplierService
  let httpService: HttpService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TTISupplierService, ConfigService, HttpService]
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

    service = module.get(TTISupplierService)
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

    it('should throw PartNotFoundException when no parts are returned', async () => {
      const partNumber = '1002'

      const res = of({
        status: 200,
        data: {
          parts: []
        }
      } as unknown as AxiosResponse)

      jest.spyOn(httpService, 'get').mockReturnValue(res)

      await expect(service.getPart(partNumber)).rejects.toThrowError(PartNotFoundException)
    })

    it('should return the part data', async () => {
      const partNumber = '1002'
      const resData = {
        parts: [{
          description: faker.word.words(),
          datasheetURL: faker.internet.url(),
          buyUrl: faker.internet.url(),
          imageURL: faker.internet.url(),
          manufacturer: faker.company.name(),
          manufacturerPartNumber: partNumber,
          packaging: "bulk",
          salesMinimum: faker.number.int(),
          availableToSell: faker.number.int({ min: 1000 }),
          leadTime: '10 weeks',
          pricing: {
            vipPrice: faker.number.float().toString(),
            quantityPriceBreaks: [
              {
                quantity: 100,
                price: faker.number.float().toString()
              }
            ]
          }
        }]
      }

      const res = of({
        status: 200,
        data: resData
      } as unknown as AxiosResponse)

      jest.spyOn(httpService, 'get').mockReturnValue(res)

      await expect(service.getPart(partNumber)).resolves.toEqual({
        description: resData.parts[0].description,
        productDoc: resData.parts[0].datasheetURL,
        productUrl: resData.parts[0].buyUrl,
        productImageUrl: resData.parts[0].imageURL,
        manufacturerName: resData.parts[0].manufacturer,
        packaging: resData.parts.map(part => ({
          type: part.packaging,
          minimumOrderQuantity: part.salesMinimum,
          quantityAvailable: part.availableToSell,
          unitPrice: parseFloat(part.pricing.vipPrice),
          priceBreaks: part.pricing.quantityPriceBreaks.map(qpb => ({
            breakQuantity: qpb.quantity,
            unitPrice: parseFloat(qpb.price),
            totalPrice: parseFloat(qpb.price) * qpb.quantity
          })),
          manufacturerLeadTime: 70
        }))
      })
    })
  })
})