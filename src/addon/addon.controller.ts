import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddonDecorator } from './addon.decorator';
import { AddonService } from './addon.service';
import { Addon } from './entities/addon.entity';

@ApiTags('부가상품')
@Controller({ path: 'addons', version: '1' })
export class AddonController {
  constructor(private readonly addonService: AddonService) {}

  @Get()
  async findAll() {
    const addons = await this.addonService.findAll();
    return { addons };
  }

  @Get(':addonId')
  async findOne(@AddonDecorator() addon: Addon) {
    return { addon };
  }
}
