import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import dayjs from 'dayjs';
import { AppModule } from '../app/app.module';
import { RequestOrderByType } from '../common/dto/request-order-by.dto';
import { Opcode } from '../common/opcode';
import { reportMonitoringMetrics } from '../common/tools/monitoring';
import { Rent, RentStatus } from '../rent/entities/rent.entity';
import { RentService } from '../rent/rent.service';

export const handler: Handler = async () => {
  const app = await NestFactory.create(AppModule);
  const rentService = app.get(RentService);
  const message = rentService.paymentFailedMessage;

  let skip = 0;
  const take = 10;
  while (true) {
    const { rents, total } = await rentService.getMany({
      orderBy: { expiredAt: RequestOrderByType.desc },
      status: [RentStatus.Activated, RentStatus.Suspended],
      take,
      skip,
    });

    if (rents.length <= 0) break;
    for (const rent of rents) {
      try {
        const expiredAt = dayjs(rent.expiredAt);
        if (rent.status === RentStatus.Suspended && rent.message !== message) {
          Logger.log(
            `${rent.name}(${rent.rentId}) Will not attempt to pay automatic payment. (${rent.message})`,
          );

          continue;
        }

        if (expiredAt.startOf('day').isAfter(dayjs())) {
          const remainingDays = expiredAt.diff(dayjs(), 'days');
          Logger.log(`${rent.name}(${rent.rentId}) is not expired.`);
          if (rent.remainingMonths <= 0 && remainingDays <= 14) {
            await sendTerminateSoon(rent, remainingDays);
          }

          continue;
        }

        if (rent.remainingMonths <= 0) {
          await sendTerminateElapse(rent, rentService);
          continue;
        }

        Logger.log(`${rent.name}(${rent.rentId}) has retry to extend.`);
        await rentService.extend(rent, false);
      } catch (err) {
        await rent.reload();
        const { opcode }: any = Opcode.PaymentFailed().getResponse();
        if (err.response.opcode === opcode) {
          await sendPaymentFailed(rent, rentService, message);
          continue;
        }

        Logger.error(
          `${rent.name}(${rent.rentId}) failed for the following reasons: ${err.message}`,
        );
      }
    }

    skip += take;
    if (total <= skip) break;
  }
};

async function sendPaymentFailed(
  rent: Rent,
  rentService: RentService,
  message: string,
): Promise<void> {
  const status = RentStatus.Suspended;
  if (rent.status !== status) {
    await rentService.update(rent, { status, message });
  }

  await reportMonitoringMetrics('mykickPaymentFailed', { rent });
  Logger.log(`${rent.name}(${rent.rentId}) has payment failed to extend.`);
}

async function sendTerminateSoon(
  rent: Rent,
  remainingDays: number,
): Promise<void> {
  await reportMonitoringMetrics('mykickSoonTerminate', { rent, remainingDays });

  Logger.log(
    `${rent.name}(${rent.rentId}) are contract period will expired in ${remainingDays}days`,
  );
}

async function sendTerminateElapse(
  rent: Rent,
  rentService: RentService,
): Promise<void> {
  const expiredAt = dayjs(rent.expiredAt);
  const elapsedDays = dayjs().diff(expiredAt, 'days');
  if (rent.status !== RentStatus.Suspended) {
    await rentService.update(rent, {
      status: RentStatus.Suspended,
      message: '계약 기간이 종료되었습니다.',
    });
  }

  await reportMonitoringMetrics('mykickTerminate', { rent, elapsedDays });
  Logger.log(
    `${rent.name}(${rent.rentId}) are contract period has been terminated.`,
  );
}
