import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
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
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Addon } from '../../addon/entities/addon.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Pricing } from '../../pricing/entities/pricing.entity';
import { Provider } from '../../provider/entities/provider.entity';
import { User } from '../../user/entities/user.entity';

export enum RentStatus {
  Requested = 'Requested', // 신청
  Shipping = 'Shipping', // 배송 시작(신청 완료!)
  Shipped = 'Shipped', // 배송 완료(활성화 대기 중)
  Activated = 'Activated', // 활성화됨(이용 중인 상태)
  Terminated = 'Terminated', // 이용 종료
  Suspended = 'Suspended', // 이용 정지
  Cancelled = 'Cancelled', // 취소됨
}

@Entity()
export class Rent extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: shortUUID.generate() })
  @IsString()
  rentId: string;

  @Column()
  @IsString()
  @ApiProperty({ example: '백종훈님의 마이킥' })
  @MinLength(2, { message: '이름이 2자 이상이여야 합니다.' })
  @MaxLength(32, { message: '이름이 32자를 초과할 수 없습니다.' })
  name: string;

  @Column({
    type: 'enum',
    enum: RentStatus,
    default: RentStatus.Requested,
  })
  @ApiProperty({
    description: '렌트 상태',
    enum: RentStatus,
    example: RentStatus.Activated,
  })
  @IsEnum(RentStatus)
  status: RentStatus;

  @IsBoolean()
  @Column({ default: false })
  @ApiProperty({ example: true })
  enabled: boolean;

  @Column()
  @ApiProperty({ example: 3, description: '남은 계약기간(개월)' })
  remainingMonths: number;

  @ManyToOne(() => User, (user) => user.rents, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Pricing, (pricing) => pricing.rents, {
    eager: true,
    onDelete: 'CASCADE',
  })
  pricing: Pricing;

  @JoinTable()
  @ManyToMany(() => Addon, (addon) => addon.rents, {
    eager: true,
    onDelete: 'CASCADE',
  })
  addons: Addon[];

  @OneToMany(() => Payment, (payment) => payment.user, {
    onDelete: 'CASCADE',
  })
  payments: Payment[];

  @ManyToOne(() => Provider, (provider) => provider.rents, {
    eager: true,
    onDelete: 'CASCADE',
  })
  provider?: Provider;

  @IsString()
  @IsOptional()
  @Column({ nullable: true })
  @Length(6, 6, { message: '킥보드 코드는 6자리입니다.' })
  @Transform(({ value }) => (value ? value : undefined))
  kickboardCode?: string;

  @IsBoolean()
  @Column({ default: false })
  @ApiProperty({ example: true })
  lightOn: boolean;

  @IsString()
  @IsOptional()
  @Column({ nullable: true })
  @ApiPropertyOptional({
    example: '재고 부족',
    description: '환불 또는 일시정지 사유',
  })
  message?: string;

  @IsDate()
  @IsOptional()
  @Column({ nullable: true })
  @ApiPropertyOptional({
    example: dayjs(),
    description: '취소일',
  })
  cancelledAt?: Date;

  @IsDate()
  @IsOptional()
  @Column({ nullable: true })
  @ApiPropertyOptional({ example: dayjs(), description: '활성화 일자' })
  activatedAt?: Date;

  @IsDate()
  @IsOptional()
  @Column({ nullable: true })
  @ApiPropertyOptional({
    example: dayjs().add(30, 'days'),
    description: '만료일',
  })
  expiredAt?: Date;

  @IsString()
  @Column({ nullable: true })
  @ApiPropertyOptional({ example: shortUUID.uuid(), description: '보험 ID' })
  insuranceId?: string;

  @IsNumber()
  @Max(25)
  @Min(5)
  @Column({ nullable: true, default: 25 })
  @ApiPropertyOptional({ example: 25, description: '최대 속도' })
  maxSpeed: number;

  @ApiProperty({ example: dayjs() })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: dayjs() })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  private generatePrimaryId() {
    this.rentId = shortUUID.generate();
  }
}
