import { Controller, Get } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PricingDecorator } from './pricing.decorator';
import { PricingService } from './pricing.service';

@ApiTags('가격표')
@Controller({ path: 'pricings', version: '1' })
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

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
}
