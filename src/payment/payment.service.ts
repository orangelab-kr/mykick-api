import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import shortUUID from 'short-uuid';
import superagent from 'superagent';
import { FindConditions, FindManyOptions, In, Repository } from 'typeorm';
import { CardService } from '../card/card.service';
import { Card, CardType } from '../card/entities/card.entity';
import { Opcode } from '../common/opcode';
import { generateWhere, WhereType } from '../common/tools/generate-where';
import { Rent } from '../rent/entities/rent.entity';
import { RentService } from '../rent/rent.service';
import { User } from '../user/entities/user.entity';
import { GetPaymentsDto } from './dto/get-payments.dto';
import { PurchasePaymentWithAmountDto } from './dto/purchase-payment-with-amount.dto';
import { PurchasePaymentWithItemsDto } from './dto/purchase-payment-with-items.dto';
import { Payment, PaymentItem, PaymentType } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(forwardRef(() => CardService))
    private readonly cardService: CardService,
    @Inject(forwardRef(() => RentService))
    private readonly rentService: RentService,
  ) {}

  public readonly productName = '마이킥 정기구독';
  public readonly paymentsEndpoint = _.get(
    process.env,
    'HIKICK_CORESERVICE_PAYMENTS_URL',
  );

  public readonly tossEndpoint = _.get(process.env, 'TOSS_ENDPOINT');
  public readonly tossApiKey = _.get(process.env, 'TOSS_API_KEY');
  public readonly tossCallbackUrl = _.get(process.env, 'TOSS_CALLBACK_URL');
  public readonly tossFailureUrl = _.get(process.env, 'TOSS_FAILURE_URL');
  public readonly tossSuccessUrl = _.get(process.env, 'TOSS_SUCCESS_URL');

  async getLastPaymentByRent(rent: Rent): Promise<Payment | undefined> {
    return this.paymentRepository.findOne({
      where: { rent },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrThrow(user: User, paymentId: string): Promise<Payment> {
    const payment = await this.get(user, paymentId);
    if (!payment) throw Opcode.CannotFindPayment();
    return payment;
  }

  async get(user: User, paymentId: string): Promise<Payment | undefined> {
    return this.paymentRepository.findOne({ user, paymentId });
  }

  async purchase(
    user: User,
    payload: PurchasePaymentWithAmountDto,
  ): Promise<Payment> {
    const { name, amount, rentId } = payload;
    const rent = await this.rentService.getOrThrow(rentId);
    const items = _.get(payload, 'items', []);
    this.logger.log(
      `${user.name}(${user.userId}) has now trying to pay ${amount}won.`,
    );

    const { cards } = await this.cardService.getAll(user);
    for (const card of cards) {
      try {
        const props = { card, user, name, amount, items, rent };
        const payment =
          card.type === CardType.TOSS
            ? await this.purchaseWithToss(props)
            : card.type === CardType.CARD
            ? await this.purchaseWithCard(props)
            : null;

        if (!payment) continue;
        return payment;
      } catch (err) {}
    }

    throw Opcode.PaymentFailed();
  }

  async purchaseWithItems(
    user: User,
    payload: PurchasePaymentWithItemsDto,
  ): Promise<Payment> {
    const amount = this.calculateAmount(payload.items);
    return this.purchase(user, _.merge(payload, { amount }));
  }

  async getMany(
    payload: GetPaymentsDto,
  ): Promise<{ payments: Payment[]; total: number }> {
    const where: FindConditions<Payment> = {};
    const find: FindManyOptions<Payment> = {
      order: { createdAt: 'DESC' },
      relations: ['user', 'rent'],
    };

    const searchTarget = {
      paymentId: WhereType.Equals,
      name: WhereType.Contains,
      token: WhereType.Contains,
      amount: WhereType.NumberEquals,
      'user.userId': WhereType.Equals,
      'user.name': WhereType.Contains,
      'user.phoneNo': WhereType.PhoneNumber,
      'rent.rentId': WhereType.Equals,
      'rent.name': WhereType.Contains,
      'rent.kickboardCode': WhereType.KickboardCode,
    };

    if (payload.orderBy) find.order = payload.orderBy;
    if (payload.take) find.take = payload.take;
    if (payload.skip) find.skip = payload.skip;
    if (payload.userIds) where.user = { userId: In(payload.userIds) };
    if (payload.rentIds) where.rent = { rentId: In(payload.rentIds) };
    if (payload.hideCancelled) where.cancelledAt = null;
    find.where = generateWhere<Rent>(where, payload.search, searchTarget);
    const [payments, total] = await this.paymentRepository.findAndCount(find);
    return { payments, total };
  }

  async refundMany(
    payments: Payment[],
    props: { reason?: string },
  ): Promise<{ success: Payment[]; failed: Payment[] }> {
    const [success, failed] = [[], []];
    for (const payment of payments) {
      try {
        const updatedPayment = await this.refund(payment, props);
        success.push(updatedPayment);
      } catch (err) {
        failed.push(payment);
      }
    }

    return { success, failed };
  }

  async refund(payment: Payment, props: { reason?: string }): Promise<Payment> {
    const { reason } = props;
    const { token, amount, card } = payment;
    const payload = { token, amount, reason };
    if (card.type === CardType.TOSS) await this.cancelWithToss(payload);
    if (card.type === CardType.CARD) await this.cancelWithCard(payload);
    this.logger.log(`${payment.name}(${payment.paymentId}) has been refunded.`);
    payment.cancelledAt = new Date();
    return payment.save();
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

  async purchaseWithCard(props: {
    user: User;
    card: Card;
    rent: Rent;
    items: PaymentItem[];
    name: string;
    amount: number;
  }): Promise<Payment> {
    const { productName } = this;
    const { user, card, rent, items, name, amount } = props;
    const endpoint = this.paymentsEndpoint;
    const billingKey = await this.cardService.getBillingKey(card);
    const paymentId = shortUUID.generate();
    const realname = user.name;
    const phone = user.phoneNo;
    const { body } = await superagent
      .post(`${endpoint}/direct/invoke`)
      .send({ billingKey, productName, amount, realname, phone });
    if (body.opcode === 0) {
      this.logger.log(
        `CARD - ${user.name}(${user.userId}) has successfully paid with ${card.name}(${card.cardId}) card. (paymentId: ${paymentId})`,
      );

      const token = body.tid;
      return this.paymentRepository
        .create({
          name,
          paymentId,
          amount,
          user,
          card,
          rent,
          items,
          token,
        })
        .save();
    }

    this.logger.warn(
      `CARD - Cannot pay with ${billingKey} billing key. (${body.msg})`,
    );

    throw Opcode.PaymentFailed({ message: body.msg });
  }

  async purchaseWithToss(props: {
    user: User;
    card: Card;
    rent: Rent;
    items: PaymentItem[];
    name: string;
    amount: number;
  }): Promise<Payment> {
    const { user, card, rent, items, name, amount } = props;
    const endpoint = this.tossEndpoint;
    const apiKey = this.tossApiKey;
    const billingKey = await this.cardService.getBillingKey(card);
    const paymentId = shortUUID.generate();
    const { body } = await superagent
      .post(`${endpoint}/v1/billing-key/bill`)
      .send({
        apiKey,
        billingKey,
        amount,
        orderNo: paymentId,
        productDesc: name.substring(0, 255),
        amountTaxFree: 0,
      });

    if (body.code === 0) {
      this.logger.log(
        `TOSS - ${user.name}(${user.userId}) has successfully paid with ${card.name}(${card.cardId}) card. (paymentId: ${paymentId})`,
      );

      const token = body.payToken;
      return this.paymentRepository
        .create({
          name,
          paymentId,
          amount,
          user,
          card,
          rent,
          items,
          token,
        })
        .save();
    }

    this.logger.warn(
      `TOSS - Cannot pay with ${billingKey} billing key. (${body.msg})`,
    );

    throw Opcode.PaymentFailed({ message: body.msg });
  }

  async cancelWithCard(props: {
    token: string;
    amount: number;
    reason?: string;
  }): Promise<void> {
    const { token: tid, amount, reason } = props;
    const endpoint = this.paymentsEndpoint;
    const { body } = await superagent
      .post(`${endpoint}/direct/cancel`)
      .send({ tid, amount, reason });
    if (body.opcode === 0) return;
    this.logger.warn(`CARD - Cannot refund with ${props.token} pay token.`);
    throw Opcode.PaymentFailed({ message: body.msg });
  }

  async cancelWithToss(props: {
    token: string;
    amount: number;
    reason?: string;
  }): Promise<void> {
    const endpoint = this.tossEndpoint;
    const { body } = await superagent.post(`${endpoint}/v2/refunds`).send({
      apiKey: this.tossApiKey,
      payToken: props.token,
      amount: props.amount,
      reason: props.reason,
    });

    this.logger.warn(`TOSS - Cannot refund with ${props.token} pay token.`);
    throw Opcode.PaymentFailed({ message: body.msg });
  }
}
