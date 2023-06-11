import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(
    ConfigModule,
  );

  const config = appContext.get(ConfigService);
  await appContext.close();

  const app = await NestFactory.create(AppModule, { cors: true });

  await app.listen(config.http.port);
}

bootstrap();
