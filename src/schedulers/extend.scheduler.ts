import { NestFactory } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import { AppModule } from '../app/app.module';
import { RequestOrderByType } from '../common/dto/request-order-by.dto';
import { RentStatus } from '../rent/entities/rent.entity';
import { RentService } from '../rent/rent.service';

export const handler: Handler = async () => {
  const app = await NestFactory.create(AppModule);
  const rentService = app.get(RentService);

  const take = 1;
  let skip = 0;
  while (true) {
    const { rents, total } = await rentService.getMany({
      orderBy: { expiredAt: RequestOrderByType.desc },
      status: [RentStatus.Activated],
      take,
      skip,
    });

    skip += take;
    if (total <= skip) break;
  }
};
