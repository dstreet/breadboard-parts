import { Test } from '@nestjs/testing'
import { faker } from '@faker-js/faker'
import { AppService } from './app.service'
import { Supplier } from './interfaces/supplier.interface'
import { Suppliers } from './constants/tokens'
import { PartNotFoundException } from './exceptions/part-not-found.exceptions'
import { Part } from './entities/part.entity'
import { AggregatedPart } from './entities/aggregated-part.entity'

function getMockSupplier(): Supplier {
  return {
    getName: jest.fn(() => 'mock supplier'),
    getPart: jest.fn()
  }
}

describe('AppService', () => {
  let appService: AppService
  let suppliers: Supplier[]

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: Suppliers,
          useValue: Array.from({ length: 2 }).map(() => getMockSupplier())
        }
      ]
    })
    .compile()

    appService = module.get(AppService)
    suppliers = module.get(Suppliers)
  })

  describe('getAggregatePartFromSuppliers', () => {
    it('should return PartNotFoundException when all suppliers fail to return the part', async () => {
      const partNumber = '101100'
      
      jest.spyOn(suppliers[0], 'getPart')
        .mockRejectedValue(new PartNotFoundException(partNumber))

      jest.spyOn(suppliers[1], 'getPart')
        .mockRejectedValue(new Error())

      await expect(appService.getAggregatePartFromSuppliers(partNumber)).rejects.toThrowError(PartNotFoundException)
    })

    it('should return the aggregated part when all suppliers return the part', async () => {
      const partNumber = '101100'

      const supplierParts: Part[] = [
        {
          name: "Female header",
          description: "female headers",
          manufacturerName: 'Super cool parts',
          packaging: [
            {
              type: 'bulk',
              minimumOrderQuantity: 1,
              quantityAvailable: 300,
              unitPrice: 0.17,
              manufacturerLeadTime: 10,
              priceBreaks: [
                {
                  breakQuantity: 1,
                  unitPrice: 0.17,
                  totalPrice: 0.17
                },
                {
                  breakQuantity: 100,
                  unitPrice: 0.10,
                  totalPrice: 10
                }
              ],
            }
          ],
          productDoc: faker.internet.url(),
          productUrl: faker.internet.url(),
          productImageUrl: faker.internet.url(),
          specifications: { one: "one" }
        },
        {
          name: "Female header",
          description: "female headers",
          manufacturerName: 'Super cool parts',
          packaging: [
            {
              type: 'each',
              minimumOrderQuantity: 1,
              quantityAvailable: 1200,
              unitPrice: 0.13,
              manufacturerLeadTime: 30,
              priceBreaks: [
                {
                  breakQuantity: 1,
                  unitPrice: 0.13,
                  totalPrice: 0.13
                },
                {
                  breakQuantity: 500,
                  unitPrice: 0.09,
                  totalPrice: 45
                }
              ],
            }
          ],
          productDoc: faker.internet.url(),
          productUrl: faker.internet.url(),
          productImageUrl: faker.internet.url(),
        }
      ]

      jest.spyOn(suppliers[0], 'getPart').mockResolvedValue(supplierParts[0])
      jest.spyOn(suppliers[0], 'getName').mockReturnValue('supplier1')

      jest.spyOn(suppliers[1], 'getPart').mockResolvedValue(supplierParts[1])
      jest.spyOn(suppliers[1], 'getName').mockReturnValue('supplier2')

      const pkg = supplierParts.flatMap((sp, i) => sp.packaging.map(p => ({ ...p, supplier: suppliers[i].getName() })))

      const expectedAggregatedPart: AggregatedPart = {
        name: supplierParts[0].name,
        description: supplierParts[0].description,
        totalStock: supplierParts
          .flatMap(p => p.packaging)
          .reduce((acc, p) => acc + p.quantityAvailable, 0),
        manufacturerLeadTime: 10,
        manufacturerName: supplierParts[0].manufacturerName,
        packaging: pkg,
        productDoc: supplierParts[0].productDoc,
        productUrl: supplierParts[0].productUrl,
        productImageUrl: supplierParts[0].productImageUrl,
        specifications: supplierParts[0].specifications,
        sourceParts: suppliers.map(s => s.getName())
      }


      await expect(appService.getAggregatePartFromSuppliers(partNumber)).resolves.toEqual(
        expectedAggregatedPart
      )
    })
  })
})