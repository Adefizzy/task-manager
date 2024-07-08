import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FilterTaskDto } from './dto/find-task.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() loggedInUser: User,
  ) {
    return await this.tasksService.create(createTaskDto, loggedInUser);
  }

  @Get()
  async findAllTasksForUser(
    @GetUser() loggedInUser: User,
    @Query() filterDto?: FilterTaskDto,
  ) {
    return await this.tasksService.findAll(loggedInUser.id, filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() loggedInUser: User,
  ) {
    const updatedTask = await this.tasksService.update(
      +id,
      updateTaskDto,
      loggedInUser,
    );
    return updatedTask;
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() loggedInUser: User) {
    return this.tasksService.remove(+id, loggedInUser);
  }
}
