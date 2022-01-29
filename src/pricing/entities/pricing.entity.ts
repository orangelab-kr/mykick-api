import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
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
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rent } from '../../rent/entities/rent.entity';

@Entity()
export class Pricing extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: shortUUID.generate() })
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
  monthlyPrice: number;

  @IsOptional()
  @IsString()
  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: '간단 설명(텍스트)',
    example: '가볍게 마이킥을 테스트할때 사용하기 좋은 상품입니다.',
  })
  @MaxLength(64, { message: '64자 이내로 작성해주세요.' })
  description: string;

  @Column()
  @ApiProperty({ description: '이용할 계약기간(개월)', example: 6 })
  @IsInt({ message: '반드시 숫자여야 합니다.' })
  @Min(1, { message: '최소 1개월부터 지정 가능합니다.' })
  @Max(120, { message: '최소 120개월 초과할 수 없습니다.' })
  periodMonths: number;

  @OneToMany(() => Rent, (rent) => rent.pricing)
  rents: Rent[];

  @IsDate()
  @ApiProperty({ example: dayjs() })
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @ApiProperty({ example: dayjs() })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  private generatePrimaryId() {
    this.pricingId = shortUUID.generate();
  }
}
