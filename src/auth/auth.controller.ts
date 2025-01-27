import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { UserDecorator } from '../user/user.decorator';
import { AuthService } from './auth.service';
import { SigninAuthDto } from './dto/signin-auth.dto';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { SessionService } from './session/session.service';
import { TokenService } from './token/token.service';

@ApiTags('인증')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
  ) {}

  @Get()
  @ApiBearerAuth()
  async getMe(@UserDecorator() user: User) {
    return { user };
  }

  @Patch()
  @ApiBearerAuth()
  async updateMe(
    @UserDecorator() beforeUser: User,
    @Body() body: UpdateAuthDto,
  ) {
    const user = await this.authService.update(beforeUser, body);
    return { user };
  }

  @Get('token')
  async loginWithToken(
    @Query('code') code: string,
    @Headers('User-Agent') userAgent,
  ) {
    const user = await this.tokenService.getUserByCode(code);
    const { token } = await this.sessionService.create(user, { userAgent });
    await this.tokenService.revokeByUser(user);
    return { user, token };
  }

  @Post('signin')
  async signin(@Body() body: SigninAuthDto, @Headers('User-Agent') userAgent) {
    const user = await this.authService.signin(body);
    const { token } = await this.sessionService.create(user, { userAgent });
    return { token, user };
  }

  @Post('signup')
  async signup(@Body() body: SignupAuthDto, @Headers('User-Agent') userAgent) {
    const user = await this.authService.signup(body);
    const { token } = await this.sessionService.create(user, { userAgent });
    return { token, user };
  }
}
