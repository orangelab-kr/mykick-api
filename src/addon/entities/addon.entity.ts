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
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rent } from '../../rent/entities/rent.entity';

export enum AddonPaymentType {
  Monthly = 'Monthly',
  Onetime = 'Onetime',
}

@Entity()
export class Addon extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: shortUUID.generate() })
  @IsString()
  addonId: string;

  @Column()
  @ApiProperty({ description: '부가상품명', example: '마이세이프 6개월' })
  @IsString({ message: '반드시 문자열이여야 합니다.' })
  @MinLength(2, { message: '이름이 2자 이상이여야 합니다.' })
  @MaxLength(32, { message: '이름이 32자를 초과할 수 없습니다.' })
  name: string;

  @Column()
  @ApiProperty({ description: '금액(원)', example: 37500 })
  @IsInt({ message: '반드시 숫자여야 합니다.' })
  @Min(500, { message: '최소 500원부터 설정할 수 있습니다.' })
  @Max(1000000, { message: '최소 100만원을 초과할 수 없습니다.' })
  price: number;

  @Column({ type: 'enum', enum: AddonPaymentType })
  @ApiProperty({ description: '결제 방식', example: AddonPaymentType.Onetime })
  @IsEnum(AddonPaymentType)
  paymentType: AddonPaymentType;

  @ManyToMany(() => Rent, (rent) => rent.addons)
  rents: Rent[];

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
