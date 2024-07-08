import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TaskStatus } from '@app/utils/contants';
import { BadRequestException } from '@nestjs/common';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column()
  description: string;

  @Column({ type: 'timestamptz', nullable: false, default: new Date() })
  dueDate: Date;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @BeforeUpdate()
  validateDueDate() {
    const now = new Date();
    console.log({ now, dueDate: this.dueDate });
    if (this.dueDate < now) {
      throw new BadRequestException(
        'Cannot update a task with an elapsed due date',
      );
    }
  }
}
