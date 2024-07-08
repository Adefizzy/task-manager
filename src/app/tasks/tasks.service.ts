import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { applyPaginationAndFilters } from '@app/utils/libs';
import { User } from '../user/entities/user.entity';
import { FilterTaskDto } from './dto/find-task.dto';

@Injectable()
export class TasksService {
  logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      dueDate: new Date(createTaskDto.dueDate),
      user,
    });
    return await this.taskRepository.save(task);
  }

  async findAll(userId: number, filters?: FilterTaskDto) {
    const queryBuilder: SelectQueryBuilder<Task> = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .where('task.userId = :userId', { userId });

    const { page, size, title, description, fromDate, toDate } = filters;
    const paginationParams: PaginationParams = { page, size };
    const filterParams: FilterParams = { title, description, fromDate, toDate };

    const result = await applyPaginationAndFilters(
      queryBuilder,
      paginationParams,
      filterParams,
      'task',
    );

    return {
      content: result.object,
      total: result.total,
      size: result.size,
      page: result.page,
    };
  }

  async findOne(id: number): Promise<Task> {
    return await this.taskRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, loggedInUser: User) {
    // Retrieve the task with user relation
    const taskToUpdate = await this.findOne(id);

    // Check if the task exists
    if (!taskToUpdate) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if the logged-in user is the owner of the task
    if (taskToUpdate.user.id !== loggedInUser.id) {
      throw new UnauthorizedException(
        'You are not authorized to update this task',
      );
    }

    taskToUpdate.title = updateTaskDto.title ?? taskToUpdate.title;
    taskToUpdate.description =
      updateTaskDto.description ?? taskToUpdate.description;
    taskToUpdate.status = updateTaskDto.status ?? taskToUpdate.status;

    // Only update dueDate if it's provided
    if (updateTaskDto.dueDate !== undefined) {
      taskToUpdate.dueDate = new Date(updateTaskDto.dueDate);
    }

    const updatedTask = await this.taskRepository.save(taskToUpdate);
    return { content: updatedTask, status: 'success' };
  }

  async remove(id: number, loggedInUser: User) {
    const taskToRemove = await this.findOne(id);

    if (!taskToRemove) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if the logged-in user is the owner of the task
    if (taskToRemove.user.id !== loggedInUser.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this task',
      );
    }

    await this.taskRepository.remove(taskToRemove);

    return {
      message: 'successfully deleted',
      status: 'success',
    };
  }
}
