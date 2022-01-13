import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AddonDecorator } from './addon.decorator';
import { AddonService } from './addon.service';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';
import { Addon } from './entities/addon.entity';

@Controller({ path: 'addons', version: '1' })
@ApiBearerAuth()
export class AddonController {
  constructor(private readonly addonService: AddonService) {}

  @Post()
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
  async update(@AddonDecorator() addon: Addon, @Body() body: UpdateAddonDto) {
    return this.addonService.update(addon, body);
  }

  @Delete(':addonId')
  async remove(@AddonDecorator() addon: Addon) {
    return this.addonService.remove(addon);
  }
}
