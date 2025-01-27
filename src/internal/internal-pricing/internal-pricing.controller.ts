import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreatePricingDto } from '../../pricing/dto/create-pricing.dto';
import { UpdatePricingDto } from '../../pricing/dto/update-pricing.dto';
import { PricingDecorator } from '../../pricing/pricing.decorator';
import { PricingService } from '../../pricing/pricing.service';

@ApiBearerAuth()
@ApiTags('관리자 / 가격표')
@Controller({ path: 'internal/pricings', version: '1' })
export class InternalPricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post()
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
    return { pricing };
  }

  @Patch(':pricingId')
  @ApiParam({ name: 'pricingId', description: '가격표 ID' })
  async update(
    @PricingDecorator() beforePricing,
    @Body() body: UpdatePricingDto,
  ) {
    const pricing = await this.pricingService.update(beforePricing, body);
    return { pricing };
  }

  @Delete(':pricingId')
  @ApiParam({ name: 'pricingId', description: '가격표 ID' })
  async remove(@PricingDecorator() pricing) {
    await this.pricingService.remove(pricing);
  }
}
