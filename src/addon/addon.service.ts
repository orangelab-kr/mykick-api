import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opcode } from '../common/opcode';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';
import { Addon } from './entities/addon.entity';

@Injectable()
export class AddonService {
  constructor(
    @InjectRepository(Addon)
    private readonly addonRepository: Repository<Addon>,
  ) {}

  async create(payload: CreateAddonDto) {
    const addon = await this.getByName(payload.name);
    if (addon) throw Opcode.ExistsAddonName({ addon });
    return this.addonRepository.create(payload).save();
  }

  async getByName(name: string): Promise<Addon | null> {
    return this.addonRepository.findOne({ name });
  }

  async findAll(): Promise<Addon[]> {
    return this.addonRepository.find();
  }

  async findOne(addonId: string): Promise<Addon | null> {
    return this.addonRepository.findOne({ addonId });
  }

  async findOneOrThrow(addonId: string): Promise<Addon> {
    const addon = await this.findOne(addonId);
    if (!addon) throw Opcode.CannotFindAddon();
    return addon;
  }

  async getManyByIds(addonIds: string[]): Promise<Addon[]> {
    return this.addonRepository.findByIds(addonIds);
  }

  async update(addon: Addon, payload: UpdateAddonDto): Promise<Addon> {
    return this.addonRepository.merge(addon, payload).save();
  }

  async remove(addon: Addon): Promise<void> {
    await addon.remove();
  }
}
