import { PickType } from '@nestjs/swagger';
import { Provider } from '../entities/provider.entity';

export class CreateProviderDto extends PickType(Provider, [
  'name',
  'code',
] as const) {}
