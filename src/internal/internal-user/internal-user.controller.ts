import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { UserDecorator } from '../../user/user.decorator';
import { UserService } from '../../user/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { UpdateUserDto } from '../../user/dto/update-user.dto';
import { User } from '../../user/entities/user.entity';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('관리자 / 사용자')
@Controller({ path: 'internal/users', version: '1' })
@ApiBearerAuth()
export class InternalUserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    const user = await this.userService.create(body);
    return { user };
  }

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return { users };
  }

  @Get(':userId')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async findOne(@UserDecorator() user: User) {
    return { user };
  }

  @Get(':userId/idcard')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async getIdcard(@UserDecorator() user: User) {
    const idcard = await this.userService.getIdcard(user);
    return { idcard };
  }

  @Patch(':userId')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async update(@UserDecorator() beforeUser: User, @Body() body: UpdateUserDto) {
    const user = await this.userService.update(beforeUser, body);
    return { user };
  }

  @Delete(':userId')
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  async remove(@UserDecorator() user: User) {
    await this.userService.remove(user);
  }
}
