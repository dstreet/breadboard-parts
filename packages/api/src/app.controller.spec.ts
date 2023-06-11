import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartNotFoundException } from './exceptions/part-not-found.exceptions';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    })
    .overrideProvider(AppService)
    .useValue({
      getAggregatePartFromSuppliers: jest.fn()
    })
    .compile();

    appController = app.get(AppController);
    appService = app.get(AppService)
  });

  describe('getPart', () => {
    it('should should return NotFoundExceptio when service returns PartNotFoundException', async () => {
      const partNumber = '10234'

      jest.spyOn(appService, 'getAggregatePartFromSuppliers').mockRejectedValue(
        new PartNotFoundException(partNumber)
      )

      await expect(appController.getPart(partNumber)).rejects.toThrowError(NotFoundException)
    })
  });
});
