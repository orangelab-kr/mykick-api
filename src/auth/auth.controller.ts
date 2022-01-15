import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { SessionService } from '../user/session/session.service';
import { UserDecorator } from '../user/user.decorator';
import { AuthService } from './auth.service';
import { SigninAuthDto } from './dto/signin-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';

@ApiTags('인증')
@Controller({ version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Get()
  @ApiBearerAuth()
  async getMe(@UserDecorator() user: User) {
    return { user };
  }

  @Post('signin')
  async signin(@Body() body: SigninAuthDto, @Headers('User-Agent') userAgent) {
    const user = await this.authService.signin(body);
    const { token } = await this.sessionService.create(user, { userAgent });
    return { token, user };
  }

  @Post('signup')
  async signup(@Body() body: SignupAuthDto) {
    return this.authService.signup(body);
  }
}
