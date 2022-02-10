import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
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

  @Get(':rentId/start')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async start(@RentDecorator() rent: Rent) {
    return this.rentService.control(rent, true);
  }

  @Get(':rentId/stop')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async stop(@RentDecorator() rent: Rent) {
    return this.rentService.control(rent, false);
  }

  @Get(':rentId/light/on')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async lightOn(@RentDecorator() rent: Rent) {
    return this.rentService.light(rent, true);
  }

  @Get(':rentId/light/off')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async lightOff(@RentDecorator() rent: Rent) {
    return this.rentService.light(rent, false);
  }

  @Get(':rentId/alarm')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async alarm(@RentDecorator() rent: Rent) {
    await this.rentService.alarm(rent);
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
