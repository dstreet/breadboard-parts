import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TTISupplierService } from './tti-supplier.service';
import { ConfigService } from '../../config/config.service';

@Module({
  imports: [HttpModule.registerAsync({
    useFactory: (config: ConfigService) => ({
      timeout: config.supplier.timeout
    }),
    inject: [ConfigService]
  })],
  providers: [TTISupplierService],
  exports: [TTISupplierService]
})
export class TTISupplierModule {}
