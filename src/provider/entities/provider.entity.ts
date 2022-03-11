import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';
import dayjs from 'dayjs';
import shortUUID from 'short-uuid';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rent } from '../../rent/entities/rent.entity';

@Entity()
export class Provider extends BaseEntity {
  @PrimaryColumn()
  @ApiProperty({ example: shortUUID().generate() })
  @IsString()
  providerId: string;

  @Column()
  @ApiProperty({ example: '카찹' })
  @IsString()
  name: string;

  @Column({ default: 'cc' })
  @ApiProperty({ example: 'cc' })
  @IsString()
  code: string;

  @ManyToOne(() => Rent, (rent) => rent.provider)
  rents: Rent[];

  @IsDate()
  @ApiProperty({ description: '제공자 등록일자', example: dayjs() })
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @ApiProperty({ example: dayjs() })
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  private generatePrimaryId() {
    this.providerId = shortUUID.generate();
  }
}
