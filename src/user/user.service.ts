import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opcode } from '../common/opcode';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(payload: CreateUserDto) {
    const user = await this.getByName(payload.name);
    if (user) throw Opcode.ExistsUserPhoneNo({ user });
    const newUser = await this.userRepository.create(payload).save();
    this.logger.log(
      `${newUser.name}(${newUser.userId}) has successfully created.`,
    );

    return newUser;
  }

  async getIdcard(user: User): Promise<string> {
    const { userId } = user;
    return this.userRepository
      .findOne({ where: { userId }, select: ['idcard'] })
      .then((u) => u.idcard);
  }

  async getByName(name: string): Promise<User | null> {
    return this.userRepository.findOne({ name });
  }

  async getByPhone(phoneNo: string): Promise<User | null> {
    return this.userRepository.findOne({ phoneNo });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ userId });
  }

  async findOneOrThrow(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) throw Opcode.CannotFindUser();
    return user;
  }

  async getByPhoneOrThrow(phoneNo: string): Promise<User> {
    const user = await this.getByPhone(phoneNo);
    if (!user) throw Opcode.CannotFindUser();
    return user;
  }

  async update(user: User, payload: UpdateUserDto): Promise<User> {
    this.logger.log(`${user.name}(${user.name}) has been updated.`);
    return this.userRepository.merge(user, payload).save();
  }

  async remove(user: User): Promise<void> {
    await user.remove();
  }
}
