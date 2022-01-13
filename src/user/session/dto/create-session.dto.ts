import { PickType } from '@nestjs/swagger';
import { Session } from '../entities/session.entity';

export class CreateSessionDto extends PickType(Session, ['userAgent']) {}
