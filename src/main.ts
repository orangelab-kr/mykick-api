import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Callback, Context, Handler } from 'aws-lambda';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import helmet from 'helmet';
import _ from 'lodash';
import serverless from 'serverless-http';
import { AppModule } from './app/app.module';
import { WrapperInterceptor } from './common/interceptors/wrapper.interceptor';
import { validationPipe } from './common/pipes/validation.pipe';

declare global {
  // eslint-disable-next-line no-var
  var handler: Handler | undefined;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableVersioning();
  app.useGlobalInterceptors(new WrapperInterceptor());
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(validationPipe());
  const config = new DocumentBuilder()
    .setTitle('Mykick API')
    .setDescription('Rent a kickboard and use it freely.')
    .setVersion('1.0.0')
    .addBearerAuth({
      description: '인증 토큰',
      name: 'Authorization',
      type: 'http',
      in: 'Header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const { validationMetadatas }: any = getFromContainer(MetadataStorage);
  const schemas = validationMetadatasToSchemas(validationMetadatas);
  document.components.schemas = _.merge(
    document.components.schemas || {},
    schemas,
  );

  SwaggerModule.setup('docs', app, document);
  await app.init();

  const adapterInstance = app.getHttpAdapter().getInstance();
  return serverless(adapterInstance);
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!global.handler) global.handler = await bootstrap();
  return global.handler(event, context, callback);
};
