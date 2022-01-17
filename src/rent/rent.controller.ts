import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { UserDecorator } from '../user/user.decorator';
import { RequestAndPayRentDto } from './dto/request-and-pay-rent.dto';
import { RentService } from './rent.service';

@ApiTags('렌트')
@ApiBearerAuth()
@Controller({ version: '1' })
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Post()
  async request(
    @UserDecorator() user: User,
    @Body() body: RequestAndPayRentDto,
  ) {
    const rent = await this.rentService.requestAndPay(user, body);
    return { rent };
  }

  @Get()
  findAll(@UserDecorator() user: User) {
    return this.rentService.getMany(user);
  }
}
