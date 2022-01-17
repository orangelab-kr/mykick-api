import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import shortUUID from 'short-uuid';
import superagent from 'superagent';
import { Repository } from 'typeorm';
import { CardService } from '../card/card.service';
import { Opcode } from '../common/opcode';
import { Rent } from '../rent/entities/rent.entity';
import { User } from '../user/entities/user.entity';
import { PurchasePaymentDto } from './dto/purchase-payment.dto';
import { Payment, PaymentItem, PaymentType } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

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
    this.logger.log(
      `${user.name}(${user.userId}) has now trying to pay ${amount}won with Toss Pay.`,
    );

    const token = await this.purchaseWithToss({
      name,
      billingKey,
      paymentId,
      amount,
    });

    this.logger.log(
      `${user.name}(${user.userId}) has successfully paid with ${card.name}(${card.cardId}) card. (paymentId: ${paymentId})`,
    );

    return this.paymentRepository
      .create({ name, paymentId, amount, user, card, rent, items, token })
      .save();
  }

  generateItems(rent: Rent, includeOnetime = false): PaymentItem[] {
    const mainItem = {
      name: '킥보드 렌트',
      amount: rent.pricing.monthlyPrice,
      type: PaymentType.Monthly,
    };
    const addons = rent.addons.filter(({ paymentType }) => {
      if (includeOnetime) return true;
      return paymentType !== PaymentType.Onetime;
    });

    const addonItems = addons.map((addon) => ({
      name: addon.name,
      amount: addon.price,
      type: addon.paymentType,
    }));

    return [mainItem, ...addonItems];
  }

  calculateAmount(items: PaymentItem[]): number {
    return _.sum(_.map(items, (item) => item.amount));
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
    this.logger.warn(`TOSS - Cannot pay with ${props.billingKey} billing key.`);
    throw Opcode.PaymentFailed({ message: body.msg });
  }
}
