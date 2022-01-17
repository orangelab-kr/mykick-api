import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import shortUUID from 'short-uuid';
import superagent from 'superagent';
import { Repository } from 'typeorm';
import { AddonPaymentType } from '../addon/entities/addon.entity';
import { CardService } from '../card/card.service';
import { Opcode } from '../common/opcode';
import { Rent } from '../rent/entities/rent.entity';
import { User } from '../user/entities/user.entity';
import { PurchasePaymentDto } from './dto/purchase-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentItem } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(forwardRef(() => CardService))
    private readonly cardService: CardService,
  ) {}

  public readonly tossProductName = '마이킥 정기구독';
  public readonly tossEndpoint = _.get(process.env, 'TOSS_ENDPOINT');
  public readonly tossApiKey = _.get(process.env, 'TOSS_API_KEY');
  public readonly tossCallbackUrl = _.get(process.env, 'TOSS_CALLBACK_URL');
  public readonly tossFailureUrl = _.get(process.env, 'TOSS_FAILURE_URL');
  public readonly tossSuccessUrl = _.get(process.env, 'TOSS_SUCCESS_URL');

  async purchase(user: User, payload: PurchasePaymentDto) {
    const { name, card, items, rent } = payload;
    const paymentId = shortUUID.generate();
    const amount = this.calculateAmount(items);
    const billingKey = await this.cardService.getBillingKey(card);
    const token = await this.purchaseWithToss({
      name,
      billingKey,
      paymentId,
      amount,
    });

    return this.paymentRepository
      .create({ name, paymentId, amount, user, card, rent, items, token })
      .save();
  }

  generateItems(rent: Rent, includeOnetime = false): PaymentItem[] {
    const mainItem = { name: '킥보드 렌트', amount: rent.pricing.monthlyPrice };
    const addons = rent.addons.filter(({ paymentType }) => {
      if (includeOnetime) return true;
      return paymentType !== AddonPaymentType.Onetime;
    });

    const addonItems = addons.map((addon) => ({
      name: addon.name,
      amount: addon.price,
    }));

    return [mainItem, ...addonItems];
  }

  calculateAmount(items: PaymentItem[]): number {
    return _.sum(_.map(items, (item) => item.amount));
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

  async purchaseWithToss(props: {
    name: string;
    billingKey: string;
    amount: number;
    paymentId: string;
  }): Promise<string> {
    const endpoint = this.tossEndpoint;
    const { body } = await superagent
      .post(`${endpoint}/billing-key/bill`)
      .send({
        apiKey: this.tossApiKey,
        billingKey: props.billingKey,
        orderNo: props.paymentId,
        productDesc: props.name.substring(0, 255),
        amount: props.amount,
        amountTaxFree: 0,
      });

    if (body.code === 0) return body.payToken;
    throw Opcode.PaymentFailed({ message: body.msg });
  }
}
