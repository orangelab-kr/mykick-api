import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import _ from 'lodash';
import { User } from '../user/entities/user.entity';
import { UserDecorator } from '../user/user.decorator';
import { GetPaymentsDto } from './dto/get-payments.dto';
import { PaymentService } from './payment.service';

@ApiTags('결제')
@ApiBearerAuth()
@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  async getMany(@UserDecorator() user: User, @Query() query: GetPaymentsDto) {
    query = _.merge(_.omit(query, 'userIds'), { userIds: [user.userId] });
    const { payments, total } = await this.paymentService.getMany(query);
    return { payments, total };
  }
}
