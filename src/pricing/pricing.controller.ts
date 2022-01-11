import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { CreatePricingDto } from 'src/pricing/dto/create-pricing.dto';
import { UpdatePricingDto } from 'src/pricing/dto/update-pricing.dto';
import { PricingService } from 'src/pricing/pricing.service';
import { PricingDecorator } from './pricing.decorator';

@Controller({ path: 'pricings', version: '1' })
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post()
  async create(@Body() createPricingDto: CreatePricingDto) {
    const pricing = await this.pricingService.create(createPricingDto);
    return { pricing };
  }

  @Get()
  async findAll() {
    const pricings = await this.pricingService.findAll();
    return { pricings };
  }

  @Get(':pricingId')
  @ApiParam({ name: 'pricingId' })
  async findOne(@PricingDecorator() pricing) {
    return pricing;
  }

  @Patch(':pricingId')
  @ApiParam({ name: 'pricingId' })
  async update(
    @PricingDecorator() beforePricing,
    @Body() updatePricingDto: UpdatePricingDto,
  ) {
    const pricing = await this.pricingService.update(
      beforePricing,
      updatePricingDto,
    );

    return { pricing };
  }

  @Delete(':pricingId')
  @ApiParam({ name: 'pricingId' })
  async remove(@PricingDecorator() pricing) {
    await this.pricingService.remove(pricing);
  }
}
