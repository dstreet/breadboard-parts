import { ConfigService as NestConfigService } from '@nestjs/config';
import { Environment } from "./env";
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  constructor(
    private configService: NestConfigService<Environment>
  ) {}

  get http() {
    return {
      port: this.configService.get<number>('PORT', 3000),
    }
  }

  get supplier() {
    return {
      timeout: this.configService.get<number>('SUPPLIER_TIMEOUT', 5000),
      arrowEndpoint: this.configService.get<string>('ARROW_ENDPOINT'),
      ttiEndpoint: this.configService.get<string>('TTI_ENDPOINT'),
    }
  }
}