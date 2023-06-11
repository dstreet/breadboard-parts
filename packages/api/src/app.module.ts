import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyArrowSupplierModule } from './suppliers/arrow-supplier/arrow-supplier.module';
import { TTISupplierModule } from './suppliers/tti-supplier/tti-supplier.module';
import { Suppliers } from './constants/tokens';
import { ArrowSupplierService } from './suppliers/arrow-supplier/arrow-supplier.service';
import { TTISupplierService } from './suppliers/tti-supplier/tti-supplier.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule, MyArrowSupplierModule, TTISupplierModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: Suppliers,
      useFactory: (arrow, tti) => [arrow, tti],
      inject: [ArrowSupplierService, TTISupplierService]
    }
  ],
})
export class AppModule {}
