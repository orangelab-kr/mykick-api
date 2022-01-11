import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import dayjs from 'dayjs';
import shortUUID from 'short-uuid';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Pricing extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: 'rdY8HtpNa5zrHwsCBHA5eB' })
  @IsString()
  pricingId: string;

  @Column()
  @ApiProperty({ description: '상품명', example: '6개월 정기구독' })
  @IsString({ message: '반드시 문자열이여야 합니다.' })
  @MinLength(2, { message: '이름이 2자 이상이여야 합니다.' })
  @MaxLength(32, { message: '이름이 32자를 초과할 수 없습니다.' })
  name: string;

  @Column()
  @ApiProperty({ description: '매월 결제될 금액(원)', example: 37500 })
  @IsInt({ message: '반드시 숫자여야 합니다.' })
  @Min(500, { message: '최소 500원부터 설정할 수 있습니다.' })
  @Max(1000000, { message: '최소 100만원을 초과할 수 없습니다.' })
  price: number;

  @Column()
  @ApiProperty({ description: '이용할 계약기간(일)', example: 180 })
  @IsInt({ message: '반드시 숫자여야 합니다.' })
  @Min(1, { message: '최소 1일부터 지정 가능합니다.' })
  @Max(3650, { message: '최소 10년을 초과할 수 없습니다.' })
  periodDays: number;

  @ApiProperty({ example: dayjs() })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: dayjs() })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  private generatePrimaryId() {
    this.pricingId = shortUUID.generate();
  }
}
