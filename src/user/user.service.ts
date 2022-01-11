import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opcode } from '../common/opcode';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(payload: CreateUserDto) {
    const user = await this.getByName(payload.name);
    if (user) throw Opcode.ExistsUserPhoneNo({ user });
    return this.userRepository.create(payload).save();
  }

  async getByName(name: string): Promise<User | null> {
    return this.userRepository.findOne({ name });
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

  async update(user: User, payload: UpdateUserDto): Promise<User> {
    return this.userRepository.merge(user, payload).save();
  }

  async remove(user: User): Promise<void> {
    await user.remove();
  }
}
