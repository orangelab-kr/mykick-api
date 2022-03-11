import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opcode } from '../common/opcode';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider } from './entities/provider.entity';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);

  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(payload: CreateProviderDto) {
    const provider = await this.getByName(payload.name);
    if (provider) throw Opcode.ExistsProviderName({ provider });
    const newProvider = await this.providerRepository.create(payload).save();
    this.logger.log(
      `${newProvider.name}(${newProvider.providerId}) has been created`,
    );

    return newProvider;
  }

  async getByName(name: string): Promise<Provider | null> {
    return this.providerRepository.findOne({ name });
  }

  async findAll(): Promise<Provider[]> {
    return this.providerRepository.find();
  }

  async findOne(providerId: string): Promise<Provider | null> {
    return this.providerRepository.findOne({ providerId });
  }

  async findOneOrThrow(providerId: string): Promise<Provider> {
    const provider = await this.findOne(providerId);
    if (!provider) throw Opcode.CannotFindProvider();
    return provider;
  }

  async findOneByCode(code: string): Promise<Provider | null> {
    return this.providerRepository.findOne({ code });
  }

  async findOneByCodeOrThrow(code: string): Promise<Provider> {
    const provider = await this.findOneByCode(code);
    if (!provider) throw Opcode.CannotFindProvider();
    return provider;
  }

  async update(
    provider: Provider,
    payload: UpdateProviderDto,
  ): Promise<Provider> {
    this.logger.log(
      `${provider.name}(${provider.providerId}) has been updated.`,
    );

    return this.providerRepository.merge(provider, payload).save();
  }

  async remove(provider: Provider): Promise<void> {
    await provider.remove();
    this.logger.log(
      `${provider.name}(${provider.providerId}) has been deleted.`,
    );
  }
}
