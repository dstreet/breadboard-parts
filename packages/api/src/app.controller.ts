import { Controller, Get, Logger, NotFoundException, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { PartNotFoundException } from './exceptions/part-not-found.exceptions';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)
  
  constructor(
    private readonly appService: AppService
  ) {}

  @Get('/part/:partNumber')
  async getPart(@Param('partNumber') partNumber: string) {
    this.logger.log('fetching part', { partNumber })
    
    try {
      return await this.appService.getAggregatePartFromSuppliers(partNumber)
    } catch (err) {
      if (err instanceof PartNotFoundException) {
        throw new NotFoundException(err.message)
      }

      throw err
    }
  }
}
