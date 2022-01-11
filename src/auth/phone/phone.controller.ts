import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RequestPhoneDto } from './dto/request-phone-dto';
import { VerifyPhoneDto } from './dto/verify-phone-dto';
import { PhoneService } from './phone.service';

@Controller('phone')
export class PhoneController {
  constructor(private readonly phoneService: PhoneService) {}

  @Get()
  async request(@Query() query: RequestPhoneDto) {
    await this.phoneService.request(query);
  }

  @Post()
  async verify(@Body() body: VerifyPhoneDto) {
    const { phoneId } = await this.phoneService.verify(body);
    return { phoneId };
  }
}
