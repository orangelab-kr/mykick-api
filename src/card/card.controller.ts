import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { UserDecorator } from '../user/user.decorator';
import { CardDecorator } from './card.decorator';
import { CardService } from './card.service';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';

@ApiTags('카드')
@Controller({ path: 'cards', version: '1' })
@ApiBearerAuth()
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  findAll(@UserDecorator() user: User) {
    return this.cardService.getAll(user);
  }

  @Get('checkout')
  async checkout(@UserDecorator() user: User) {
    const checkoutUri = await this.cardService.getTossCheckoutUrl(user);
    return { checkoutUri };
  }

  @Get('sync')
  async sync(@UserDecorator() user: User) {
    const card = await this.cardService.syncWithToss(user);
    return { card };
  }

  @Get(':cardId')
  @ApiParam({ name: 'cardId', description: '카드 ID' })
  findOne(@CardDecorator() card: Card) {
    return { card };
  }

  @Patch(':cardId')
  @ApiParam({ name: 'cardId', description: '카드 ID' })
  async update(
    @CardDecorator() updatedCard: Card,
    @Body() body: UpdateCardDto,
  ) {
    const card = await this.cardService.update(updatedCard, body);
    return { card };
  }

  @Delete(':cardId')
  @ApiParam({ name: 'cardId', description: '카드 ID' })
  async remove(@CardDecorator() card: Card) {
    await this.cardService.remove(card);
  }
}
