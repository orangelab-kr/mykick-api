import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import _ from 'lodash';
import { AppService } from '../app/app.service';

export const swaggerPath = 'docs';
export const setupSwagger = async (app: INestApplication) => {
  const clusterInfo = await new AppService().getClusterInfo();
  const config = new DocumentBuilder()
    .setTitle(clusterInfo.name)
    .setDescription(clusterInfo.description)
    .setVersion(clusterInfo.version)
    .addTag('서버', '서버 상태를 관리합니다.')
    .addTag('인증', '로그인 및 인증과 관련된 일을 처리합니다.')
    .addTag('렌트', '렌트를 요청하고 관리합니다.')
    .addTag('카드', '카드를 등록하거나 관리합니다.')
    .addTag('결제', '결제 내역을 조회합니다.')
    .addTag('가격표', '계약 기간, 금액을 관리합니다.')
    .addTag('부가상품', '부가상품을 관리합니다.')
    .addTag('관리자 / 사용자', '사용자를 관리합니다.')
    .addTag('관리자 / 렌트', '렌트를 관리합니다.')
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
