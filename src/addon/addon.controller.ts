import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddonDecorator } from './addon.decorator';
import { AddonService } from './addon.service';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';
import { Addon } from './entities/addon.entity';

@ApiTags('부가상품')
@Controller({ path: 'addons', version: '1' })
export class AddonController {
  constructor(private readonly addonService: AddonService) {}

  @Post()
  @ApiBearerAuth()
  async create(@Body() body: CreateAddonDto) {
    const addon = await this.addonService.create(body);
    return { addon };
  }

  @Get()
  async findAll() {
    const addons = await this.addonService.findAll();
    return { addons };
  }

  @Get(':addonId')
  async findOne(@AddonDecorator() addon: Addon) {
    return { addon };
  }

  @Patch(':addonId')
  @ApiBearerAuth()
  async update(@AddonDecorator() addon: Addon, @Body() body: UpdateAddonDto) {
    return this.addonService.update(addon, body);
  }

  @Delete(':addonId')
  @ApiBearerAuth()
  async remove(@AddonDecorator() addon: Addon) {
    return this.addonService.remove(addon);
  }
}
