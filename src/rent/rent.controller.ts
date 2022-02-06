import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { url } from 'inspector';
import { User } from '../user/entities/user.entity';
import { UserDecorator } from '../user/user.decorator';
import { ActivateRentDto } from './dto/activate-rent.dto';
import { EstimateRentDto } from './dto/estimate-rent.dto';
import { RequestAndPayRentDto } from './dto/request-and-pay-rent.dto';
import { Rent } from './entities/rent.entity';
import { RentDecorator } from './rent.decorator';
import { RentService } from './rent.service';

@ApiTags('렌트')
@Controller({ path: 'rents', version: '1' })
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Get()
  @ApiBearerAuth()
  findAll(@UserDecorator() user: User) {
    return this.rentService.getManyByUser(user);
  }

  @Get(':rentId')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async find(@RentDecorator() rent: Rent) {
    return { rent };
  }

  @Post(':rentId/activate')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async activate(
    @RentDecorator() beforeRent: Rent,
    @Body() body: ActivateRentDto,
  ) {
    const rent = await this.rentService.activateByUser(beforeRent, body);
    return { rent };
  }

  @Post('estimate')
  async getEstimate(@Body() body: EstimateRentDto) {
    const { items, total } = await this.rentService.getEstimateView(body);
    return { items, total };
  }

  @Post()
  @ApiBearerAuth()
  async request(
    @UserDecorator() user: User,
    @Body() body: RequestAndPayRentDto,
  ) {
    const rent = await this.rentService.requestAndPay(user, body);
    return { rent };
  }
}
