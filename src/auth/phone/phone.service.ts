import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs from 'dayjs';
import _ from 'lodash';
import superagent from 'superagent';
import { FindCondition, IsNull, MoreThan, Repository } from 'typeorm';
import { Opcode } from '../../common/opcode';
import { RequestPhoneDto } from './dto/request-phone-dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { Phone } from './entities/phone.entity';

@Injectable()
export class PhoneService {
  private readonly logger = new Logger(PhoneService.name);

  bypassCode = _.get(process.env, 'PHONE_BYPASS_CODE');
  daliyPhoneLimit = _.parseInt(_.get(process.env, 'PHONE_DALIY_LIMIT', '6'));

  constructor(
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
  ) {}

  async request(payload: RequestPhoneDto): Promise<void> {
    const { phoneNo, debug } = payload;
    await this.checkHasLimitExcess(phoneNo, true);
    const verifyCode = this.generateVerifyCode();
    await this.revokeByPhoneNo(phoneNo);
    if (!debug) await this.send(phoneNo, 'mykick_verify', { verifyCode });
    await this.phoneRepository.create({ phoneNo, verifyCode }).save();
    this.logger.log(`${phoneNo} has been requested (debug: ${debug})`);
  }

  async verify(payload: VerifyPhoneDto): Promise<Phone> {
    const revokedAt = IsNull();
    const expiredAt = MoreThan(new Date());
    const { phoneNo, verifyCode } = payload;
    const isBypass = verifyCode === this.bypassCode;
    const where: FindCondition<Phone> = { phoneNo, revokedAt, expiredAt };
    if (!isBypass) where.verifyCode = verifyCode;
    const phone = await this.phoneRepository.findOne(where);
    if (!phone) throw Opcode.InvalidVerifyCode();
    this.logger.log(
      `${phoneNo}(${phone.phoneId}) has been verified (bypass: ${isBypass})`,
    );

    return phone;
  }

  async revoke(phone: Phone): Promise<void> {
    const { phoneNo, phoneId } = phone;
    this.logger.log(`${phoneNo}(${phoneId}) has been revoked.`);
    phone.revokedAt = new Date();
    await phone.save();
  }

  async revokeByPhoneNo(phoneNo: string): Promise<void> {
    const revokedAt = new Date();
    const res = await this.phoneRepository.update({ phoneNo }, { revokedAt });
    this.logger.log(`${phoneNo} has been all revoked. (${res.affected})`);
  }

  async checkHasLimitExcess(
    phoneNo: string,
    allowThrow = false,
  ): Promise<boolean> {
    const createdAt = MoreThan(dayjs().subtract(1, 'days').toDate());
    const count = await this.phoneRepository.count({ phoneNo, createdAt });
    if (count < this.daliyPhoneLimit) return true;
    this.logger.warn(`${phoneNo} has been blocked! (${this.daliyPhoneLimit})`);
    if (allowThrow) throw Opcode.PhoneDaliyLimit();
    return false;
  }

  async findOne(phoneId: string): Promise<Phone | null> {
    return this.phoneRepository.findOne({
      phoneId,
      revokedAt: IsNull(),
      expiredAt: MoreThan(new Date()),
    });
  }

  async findOneOrThrow(phoneId: string): Promise<Phone> {
    const phone = await this.findOne(phoneId);
    if (!phone) throw Opcode.InvalidPhone();
    return phone;
  }

  public async send(phoneNo: string, name: string, fields: any): Promise<void> {
    const endpoint = _.get(process.env, 'MG_ENDPOINT');
    if (!endpoint) throw Opcode.InvalidError();
    const accessKeyId = _.get(process.env, 'MG_ACCESS_KEY_ID');
    const secretAccessKey = _.get(process.env, 'MG_SECRET_ACCESS_KEY');
    const phone = `+82${phoneNo.replace(/-/, '').substring(1)}`;
    await superagent
      .post(`${endpoint}/send`)
      .set('X-MESSAGE-GATEWAY-ACCESS-KEY-ID', accessKeyId)
      .set('X-MESSAGE-GATEWAY-SECRET-ACCESS-KEY', secretAccessKey)
      .send({ name, phone, fields });
    this.logger.log(`Successfully sent a text to ${phoneNo} / ${name}`);
  }

  private generateVerifyCode(): string {
    return `${Math.random() * 1e16}`.substring(0, 6);
  }
}
