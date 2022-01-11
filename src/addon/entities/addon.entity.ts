import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
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

export enum AddonPaymentType {
  MONTHLY = 'monthly',
  ONETIME = 'onetime',
}

@Entity()
export class Addon extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: '7heP5xtMP5fitNP92dP56P' })
  @IsString()
  addonId: string;

  @Column()
  @ApiProperty({ description: '부가상품명', example: '마이세이프 6개월' })
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

  @Column({ type: 'enum', enum: AddonPaymentType })
  @ApiProperty({ description: '결제 방식', example: 'ONETIME' })
  @IsEnum(AddonPaymentType)
  paymentType: AddonPaymentType;

  @IsOptional()
  @Column({ nullable: true })
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
    this.addonId = shortUUID.generate();
  }
}
