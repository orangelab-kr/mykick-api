import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
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
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentType } from '../../payment/entities/payment.entity';
import { Rent } from '../../rent/entities/rent.entity';

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

  @IsString()
  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: '간단 설명(텍스트)',
    example:
      '킥보드 왼쪽에 장착되며, 좌회전시 더욱 안전하게 운행할 수 있습니다.',
  })
  @MaxLength(64, { message: '64자 이내로 작성해주세요.' })
  description?: string;

  @Column()
  @ApiProperty({ description: '금액(원)', example: 37500 })
  @IsInt({ message: '반드시 숫자여야 합니다.' })
  @Min(500, { message: '최소 500원부터 설정할 수 있습니다.' })
  @Max(1000000, { message: '최소 100만원을 초과할 수 없습니다.' })
  price: number;

  @IsOptional()
  @Column({ nullable: true })
  @ApiPropertyOptional({ description: '상품 이미지', example: null })
  @IsUrl({ message: '올바른 경로가 아닙니다.' })
  image?: string;

  @Column({ type: 'enum', enum: PaymentType })
  @ApiProperty({ description: '결제 방식', example: PaymentType.Onetime })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

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
