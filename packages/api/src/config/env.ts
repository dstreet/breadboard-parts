import { plainToClass, Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsOptional,
  validateSync,
} from 'class-validator';

export class Environment {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  PORT: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  SUPPLIER_TIMEOUT: number

  @IsDefined()
  ARROW_ENDPOINT: string

  @IsDefined()
  TTI_ENDPOINT: string
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(Environment, config);

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}