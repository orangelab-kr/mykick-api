import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { UserDecorator } from './user.decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@Controller({ version: '1' })
@ApiBearerAuth()
export class UserController {
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
