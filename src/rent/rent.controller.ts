import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { UserDecorator } from '../user/user.decorator';
import { ActivateRentDto } from './dto/activate-rent.dto';
import { EstimateRentDto } from './dto/estimate-rent.dto';
import { GetRentsDto } from './dto/get-rents.dto';
import { RequestRentDto } from './dto/request-rent.dto';
import { UpdateUserRentDto } from './dto/update-user-rent';
import { Rent } from './entities/rent.entity';
import { RentDecorator } from './rent.decorator';
import { RentService } from './rent.service';

@ApiTags('렌트')
@Controller({ path: 'rents', version: '1' })
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Get()
  @ApiBearerAuth()
  findAll(@UserDecorator() user: User, @Query() query: GetRentsDto) {
    return this.rentService.getManyByUser(user, query);
  }

  @Get(':rentId')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async find(@RentDecorator() rent: Rent) {
    return { rent };
  }

  @Patch(':rentId')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async update(
    @RentDecorator() beforeRent: Rent,
    @Body() body: UpdateUserRentDto,
  ) {
    const rent = await this.rentService.update(beforeRent, body);
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
  async start(@RentDecorator() beforeRent: Rent) {
    const rent = await this.rentService.control(beforeRent, true);
    return { rent };
  }

  @Get(':rentId/stop')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async stop(@RentDecorator() beforeRent: Rent) {
    const rent = await this.rentService.control(beforeRent, false);
    return { rent };
  }

  @Get(':rentId/light/on')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async lightOn(@RentDecorator() beforeRent: Rent) {
    const rent = await this.rentService.light(beforeRent, true);
    return { rent };
  }

  @Get(':rentId/light/off')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async lightOff(@RentDecorator() beforeRent: Rent) {
    const rent = await this.rentService.light(beforeRent, false);
    return { rent };
  }

  @Get(':rentId/alarm')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async alarm(@RentDecorator() beforeRent: Rent) {
    const rent = await this.rentService.alarm(beforeRent);
    return { rent };
  }

  @Get(':rentId/status')
  @ApiBearerAuth()
  @ApiParam({ name: 'rentId', description: '렌트 ID' })
  async status(@RentDecorator() rent: Rent) {
    const status = await this.rentService.getStatus(rent);
    return { status };
  }

  @Post()
  @ApiBearerAuth()
  async request(@UserDecorator() user: User, @Body() body: RequestRentDto) {
    const rent = await this.rentService.requestAndPay(user, body);
    return { rent };
  }
}
