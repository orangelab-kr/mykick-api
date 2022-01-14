import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import superagent from 'superagent';
import { Repository } from 'typeorm';
import { Opcode } from '../../common/opcode';
import { User } from '../entities/user.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card, CardType } from './entities/card.entity';

@Injectable()
export class CardService {
  private readonly logger = new Logger(CardService.name);
  private readonly tossProductName = '마이킥 정기구독';
  private readonly tossEndpoint = _.get(process.env, 'TOSS_ENDPOINT');
  private readonly tossApiKey = _.get(process.env, 'TOSS_API_KEY');
  private readonly tossCallbackUrl = _.get(process.env, 'TOSS_CALLBACK_URL');
  private readonly tossFailureUrl = _.get(process.env, 'TOSS_FAILURE_URL');
  private readonly tossSuccessUrl = _.get(process.env, 'TOSS_SUCCESS_URL');

  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  async getAll(user: User): Promise<{ cards: Card[]; total: number }> {
    const [cards, total] = await this.cardRepository.findAndCount({ user });
    return { cards, total };
  }

  async get(user: User, cardId: string): Promise<Card | null> {
    return this.cardRepository.findOne({ user, cardId });
  }

  async update(card: Card, payload: UpdateCardDto): Promise<Card> {
    const updatedCard = await this.cardRepository.merge(card, payload).save();
    this.logger.log(`${card.name}(${card.cardId}) has been updated`);
    return updatedCard;
  }

  async getOrThrow(user: User, cardId: string): Promise<Card> {
    const card = await this.get(user, cardId);
    if (!card) throw Opcode.CannotFindCard();
    return card;
  }

  async getByType(user: User, type: CardType): Promise<Card | null> {
    return this.cardRepository.findOne({ user, type });
  }

  async getByTypeOrThrow(user: User, type: CardType): Promise<Card> {
    const card = await this.getByType(user, type);
    if (!card) throw Opcode.CannotFindCard();
    return card;
  }

  async getByName(user: User, name: string): Promise<Card | null> {
    return this.cardRepository.findOne({ user, name });
  }

  async getByNameOrThrow(user: User, name: string): Promise<Card> {
    const card = await this.getByName(user, name);
    if (!card) throw Opcode.CannotFindCard();
    return card;
  }

  async syncWithToss(user: User): Promise<Card> {
    this.logger.log(
      `TOSS - ${user.name}(${user.userId}) has been requested sync with toss.`,
    );

    const name = '토스로 결제';
    const type = CardType.TOSS;
    const billingKey = await this.getBillingKeyFromToss(user);
    const card = await this.cardRepository
      .createQueryBuilder()
      .leftJoinAndSelect('Card.user', 'user')
      .where('user.userId = :userId', user)
      .andWhere('Card.type = :type', { type })
      .addSelect('billingKey')
      .getOne();

    if (card) {
      if (card.billingKey !== billingKey) {
        return <Card>_.omit(card, 'billingKey');
      }

      await this.remove(card);
    }

    return this.create(user, { name, type, billingKey });
  }

  async create(user: User, payload: CreateCardDto): Promise<Card> {
    const card = await this.getByName(user, payload.name);
    if (card) throw Opcode.ExistsCardName({ card });
    const newCard = await this.cardRepository
      .create({ ...payload, user })
      .save();

    delete newCard.billingKey;
    return newCard;
  }

  async remove(card: Card): Promise<void> {
    const { cardId } = card;
    const billingKey =
      card.billingKey ||
      (await this.cardRepository
        .createQueryBuilder()
        .where('Card.cardId = :cardId', card)
        .addSelect('Card.billingKey')
        .getOne()
        .then((card) => card.billingKey));

    if (billingKey && card.type === CardType.TOSS) {
      await this.revokeTossBillingKey(billingKey);
    }

    this.logger.log(`${card.name}(${card.cardId}) has been removed`);
    await card.remove();
  }

  async getBillingKeyFromToss(user: User): Promise<string | undefined> {
    const { userId } = user;
    const apiKey = this.tossApiKey;
    const { body } = await superagent
      .post(`${this.tossEndpoint}/status`)
      .send({ userId, apiKey });
    return <string | undefined>body.billingKey;
  }

  async revokeTossBillingKey(billingKey: string): Promise<void> {
    const apiKey = this.tossApiKey;
    await superagent
      .post(`${this.tossEndpoint}/remove`)
      .send({ apiKey, billingKey });
    this.logger.log(`TOSS - ${billingKey} has been revoked.`);
  }

  async revokeIfTossBillingKeyExists(user: User): Promise<void> {
    const billingKey = await this.getBillingKeyFromToss(user);
    if (!billingKey) return;

    await this.revokeTossBillingKey(billingKey);
  }

  async getTossCheckoutUrl(user: User): Promise<string> {
    await this.revokeIfTossBillingKeyExists(user);
    const { body } = await superagent.post(this.tossEndpoint).send({
      userId: user.userId,
      apiKey: this.tossApiKey,
      productDesc: this.tossProductName,
      resultCallback: this.tossCallbackUrl,
      returnSuccessUrl: this.tossSuccessUrl,
      returnFailureUrl: this.tossFailureUrl,
    });

    if (!body.checkoutUri) throw Opcode.CannotGetCheckout();
    this.logger.log(`TOSS - ${user.name}(${user.userId}) has been requested.`);
    return body.checkoutUri;
  }
}
