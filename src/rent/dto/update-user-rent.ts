import { PickType } from '@nestjs/swagger';
import { UpdateRentDto } from './update-rent.dto';

export class UpdateUserRentDto extends PickType(UpdateRentDto, [
  'name',
  'maxSpeed',
]) {}
