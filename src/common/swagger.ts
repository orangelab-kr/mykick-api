import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import _ from 'lodash';
import { AppService } from '../app/app.service';

export const swaggerPath = 'api';
export const setupSwagger = async (app: INestApplication) => {
  const clusterInfo = await new AppService().getClusterInfo();
  const config = new DocumentBuilder()
    .setTitle(clusterInfo.name)
    .setDescription(clusterInfo.description)
    .setVersion(clusterInfo.version)
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
    _.get(document, 'components.schemas', {}),
    schemas,
  );

  SwaggerModule.setup(swaggerPath, app, document);
};

export const transferSwaggerPath = (event: any) => {
  let { path } = event;
  if (path === `/${swaggerPath}`) path = `/${swaggerPath}/`;
  if (path.startsWith('/swagger-ui')) path = `/${swaggerPath}${path}`;
  event.path = path;
  return event;
};
