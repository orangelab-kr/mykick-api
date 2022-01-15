import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import helmet from 'helmet';
import serverless from 'serverless-http';
import { AppModule } from './app/app.module';
import { WrapperInterceptor } from './common/interceptors/wrapper.interceptor';
import { validationPipe } from './common/pipes/validation.pipe';
import { setupSwagger, transferSwaggerPath } from './common/swagger';

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
  await setupSwagger(app);
  await app.init();

  const adapterInstance = app.getHttpAdapter().getInstance();
  return serverless(adapterInstance);
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  event = transferSwaggerPath(event);
  if (!global.handler) global.handler = await bootstrap();

  return global.handler(event, context, callback);
};
