import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetRentsDto } from '../../rent/dto/get-rents.dto';
import { RenewalRentDto } from '../../rent/dto/renewal-rent.dto';
import { UpdateRentDto } from '../../rent/dto/update-rent.dto';
import { Rent } from '../../rent/entities/rent.entity';
import { RentDecorator } from '../../rent/rent.decorator';
import { RentService } from '../../rent/rent.service';

@ApiTags('관리자 / 렌트')
@Controller({ path: 'internal/rents', version: '1' })
@ApiBearerAuth()
export class InternalRentController {
  constructor(private rentService: RentService) {}

  @Get()
  async getMany(@Query() query: GetRentsDto) {
    const { rents, total } = await this.rentService.getMany(query);
    return { rents, total };
  }

  @Get(':rentId')
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async get(@RentDecorator() rent: Rent) {
    return { rent };
  }

  @Patch(':rentId')
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async update(@RentDecorator() beforeRent: Rent, @Body() body: UpdateRentDto) {
    const rent = await this.rentService.update(beforeRent, body);
    return { rent };
  }

  @Post(':rentId/renewal')
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async renewal(
    @RentDecorator() beforeRent: Rent,
    @Body() body: RenewalRentDto,
  ) {
    const rent = await this.rentService.renewal(beforeRent, body);
    return { rent };
  }
}
