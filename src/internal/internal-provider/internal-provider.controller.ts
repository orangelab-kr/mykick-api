import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateProviderDto } from '../../provider/dto/create-provider.dto';
import { UpdateProviderDto } from '../../provider/dto/update-provider.dto';
import { ProviderDecorator } from '../../provider/provider.decorator';
import { ProviderService } from '../../provider/provider.service';

@ApiBearerAuth()
@ApiTags('관리자 / 제공자')
@Controller({ path: 'internal/providers', version: '1' })
export class InternalProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  async create(@Body() body: CreateProviderDto) {
    const provider = await this.providerService.create(body);
    return { provider };
  }

  @Get()
  async findAll() {
    const providers = await this.providerService.findAll();
    return { providers };
  }

  @Get(':providerId')
  @ApiParam({ name: 'providerId', description: '가격표 ID' })
  async findOne(@ProviderDecorator() provider) {
    return { provider };
  }

  @Patch(':providerId')
  @ApiParam({ name: 'providerId', description: '가격표 ID' })
  async update(
    @ProviderDecorator() beforeProvider,
    @Body() body: UpdateProviderDto,
  ) {
    const provider = await this.providerService.update(beforeProvider, body);
    return { provider };
  }

  @Delete(':providerId')
  @ApiParam({ name: 'providerId', description: '제공자 ID' })
  async remove(@ProviderDecorator() provider) {
    await this.providerService.remove(provider);
  }
}
