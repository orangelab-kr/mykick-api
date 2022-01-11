import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import _ from 'lodash';
import { AppModule } from './app/app.module';
import { WrapperInterceptor } from './common/interceptors/wrapper.interceptor';
import { validationPipe } from './common/pipes/validation';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning();
  app.useGlobalInterceptors(new WrapperInterceptor());
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(validationPipe());
  const config = new DocumentBuilder()
    .setTitle('Mykick API')
    .setDescription('Rent a kickboard and use it freely.')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const { validationMetadatas }: any = getFromContainer(MetadataStorage);
  const schemas = validationMetadatasToSchemas(validationMetadatas);
  document.components.schemas = _.merge(
    document.components.schemas || {},
    schemas,
  );

  SwaggerModule.setup('docs', app, document);
  await app.listen(_.parseInt(_.get(process.env, 'PORT', '3000')));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
