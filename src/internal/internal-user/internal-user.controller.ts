import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserDecorator } from '../../user/user.decorator';
import { UserService } from '../../user/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { UpdateUserDto } from '../../user/dto/update-user.dto';
import { User } from '../../user/entities/user.entity';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetPaymentsDto } from '../../payment/dto/get-payments.dto';
import { PaymentService } from '../../payment/payment.service';
import _ from 'lodash';
import { PurchasePaymentDto } from '../../payment/dto/purchase-payment.dto';
import { PaymentDecorator } from '../../payment/payment.decorator';
import { CancelPaymentDto } from '../../payment/dto/cancel-payment.dto';

@ApiTags('관리자 / 사용자')
@Controller({ path: 'internal/users', version: '1' })
@ApiBearerAuth()
export class InternalUserController {
  constructor(
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    const user = await this.userService.create(body);
    return { user };
  }

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return { users };
  }

  @Get(':userId')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async findOne(@UserDecorator() user: User) {
    return { user };
  }

  @Get(':userId/idcard')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async getIdcard(@UserDecorator() user: User) {
    const idcard = await this.userService.getIdcard(user);
    return { idcard };
  }

  @Patch(':userId')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async update(@UserDecorator() beforeUser: User, @Body() body: UpdateUserDto) {
    const user = await this.userService.update(beforeUser, body);
    return { user };
  }

  @Delete(':userId')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async remove(@UserDecorator() user: User) {
    await this.userService.remove(user);
  }

  @Get(':userId/payments')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async getPayments(
    @UserDecorator() user: User,
    @Query() query: GetPaymentsDto,
  ) {
    query = _.merge(_.omit(query, 'userIds'), { userIds: [user.userId] });
    const { payments, total } = await this.paymentService.getMany(query);
    return { payments, total };
  }

  @Post(':userId/payments')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async createPayments(
    @UserDecorator() user: User,
    @Body() body: PurchasePaymentDto,
  ) {
    const payment = await this.paymentService.purchase(user, body);
    return { payment };
  }

  @Get(':userId/payments/:paymentId')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async getPayment(@PaymentDecorator() payment) {
    return { payment };
  }

  @Delete(':userId/payments/:paymentId')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async refundPayment(
    @PaymentDecorator() beforePayment,
    @Body() body: CancelPaymentDto,
  ) {
    const payment = await this.paymentService.refund(beforePayment, body);
    return { payment };
  }
}
