import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { validationPipe } from './common/pipes/validation';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning();
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(validationPipe());

  await app.listen(3000);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
