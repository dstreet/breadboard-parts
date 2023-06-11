import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ArrowSupplierService } from './arrow-supplier.service';
import { ConfigService } from '../../config/config.service';

@Module({
  imports: [HttpModule.registerAsync({
    useFactory: (config: ConfigService) => ({
      timeout: config.supplier.timeout
    }),
    inject: [ConfigService]
  })],
  providers: [ArrowSupplierService],
  exports: [ArrowSupplierService]
})
export class MyArrowSupplierModule {}
