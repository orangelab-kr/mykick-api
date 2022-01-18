import { PartialType } from '@nestjs/swagger';
import { SignupAuthDto } from './signup-auth.dto';

export class UpdateAuthDto extends PartialType(SignupAuthDto) {}
