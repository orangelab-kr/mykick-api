import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { PricingService } from './pricing.service';
import { PricingDecorator } from './pricing.decorator';

@ApiTags('가격표')
@Controller({ path: 'pricings', version: '1' })
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post()
  @ApiBearerAuth()
  async create(@Body() body: CreatePricingDto) {
    const pricing = await this.pricingService.create(body);
    return { pricing };
  }

  @Get()
  async findAll() {
    const pricings = await this.pricingService.findAll();
    return { pricings };
  }

  @Get(':pricingId')
  @ApiParam({ name: 'pricingId', description: '가격표 ID' })
  async findOne(@PricingDecorator() pricing) {
    return pricing;
  }

  @Patch(':pricingId')
  @ApiBearerAuth()
  @ApiParam({ name: 'pricingId', description: '가격표 ID' })
  async update(
    @PricingDecorator() beforePricing,
    @Body() body: UpdatePricingDto,
  ) {
    const pricing = await this.pricingService.update(beforePricing, body);
    return { pricing };
  }

  @Delete(':pricingId')
  @ApiBearerAuth()
  @ApiParam({ name: 'pricingId', description: '가격표 ID' })
  async remove(@PricingDecorator() pricing) {
    await this.pricingService.remove(pricing);
  }
}
