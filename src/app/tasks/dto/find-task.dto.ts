import { PartialType } from '@nestjs/swagger';
import { UpdateTaskDto } from './update-task.dto';
import { IsDateString, IsOptional } from 'class-validator';

export class FilterTaskDto extends PartialType(UpdateTaskDto) {
  @IsOptional()
  page: number;

  @IsOptional()
  size: number;

  @IsOptional()
  @IsDateString()
  fromDate: Date;

  @IsOptional()
  @IsDateString()
  toDate: Date;
}
