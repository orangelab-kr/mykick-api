import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler } from 'aws-lambda';
import compression from 'compression';
import helmet from 'helmet';
import _ from 'lodash';
import serverless from 'serverless-http';
import { AppModule } from './app/app.module';
import { WrapperInterceptor } from './common/interceptors/wrapper.interceptor';
import { validationPipe } from './common/pipes/validation.pipe';
import { setupSwagger, transferSwaggerPath } from './common/swagger';

declare global {
  // eslint-disable-next-line no-var
  var handler: Handler | undefined;
}

async function bootstrap(isServerless = false) {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());
  app.enableCors();
  app.useGlobalInterceptors(new WrapperInterceptor());
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(validationPipe());
  await setupSwagger(app);
  await app.init();

  const port = _.parseInt(_.get(process.env, 'PORT', '3000'));
  if (isServerless) app.listen(port);
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

if (!process.env.LAMBDA_RUNTIME_DIR) bootstrap(true);
