import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { AddonDecorator } from './addon.decorator';
import { AddonService } from './addon.service';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';
import { Addon } from './entities/addon.entity';

@Controller({ path: 'addons', version: '1' })
export class AddonController {
  constructor(private readonly addonService: AddonService) {}

  @Post()
  async create(@Body() createAddonDto: CreateAddonDto) {
    const addon = await this.addonService.create(createAddonDto);
    return { addon };
  }

  @Get()
  async findAll() {
    const addons = await this.addonService.findAll();
    return { addons };
  }

  @Get(':addonId')
  findOne(@AddonDecorator() addon: Addon) {
    return { addon };
  }

  @Patch(':addonId')
  update(
    @AddonDecorator() addon: Addon,
    @Body() updateAddonDto: UpdateAddonDto,
  ) {
    return this.addonService.update(addon, updateAddonDto);
  }

  @Delete(':addonId')
  remove(@AddonDecorator() addon: Addon) {
    return this.addonService.remove(addon);
  }
}
