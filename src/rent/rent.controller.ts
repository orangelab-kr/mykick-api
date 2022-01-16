import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { UserDecorator } from '../user/user.decorator';
import { RequestRentDto } from './dto/request-rent.dto';
import { RentService } from './rent.service';

@ApiTags('렌트')
@ApiBearerAuth()
@Controller({ version: '1' })
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Post()
  create(@UserDecorator() user: User, @Body() body: RequestRentDto) {
    return this.rentService.request(user, body);
  }

  @Get()
  findAll(@UserDecorator() user: User) {
    return this.rentService.getMany(user);
  }
}
