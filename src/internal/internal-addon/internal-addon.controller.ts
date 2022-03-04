import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddonDecorator } from '../../addon/addon.decorator';
import { AddonService } from '../../addon/addon.service';
import { CreateAddonDto } from '../../addon/dto/create-addon.dto';
import { UpdateAddonDto } from '../../addon/dto/update-addon.dto';
import { Addon } from '../../addon/entities/addon.entity';

@ApiTags('관리자 / 추가 상품')
@Controller({ path: 'internal/addons', version: '1' })
@ApiBearerAuth()
export class InternalAddonController {
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
