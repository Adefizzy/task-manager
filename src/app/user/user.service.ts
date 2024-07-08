import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { hashUtils } from '@app/utils/libs';

@Injectable()
export class UserService {
  logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user: User = new User();
      user.firstName = createUserDto.firstName;
      user.lastName = createUserDto.lastName;
      user.email = createUserDto.email;
      user.password = createUserDto.password;
      this.logger.log('Creating new user');
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if ((error as any).code === '23505') {
          throw new BadRequestException('Email already exists');
        }
      }
      throw error;
    }
  }

  findOne(param: Partial<Omit<CreateUserDto, 'password'>> & { id?: number }) {
    return this.usersRepository.findOneBy(param);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user || !(await hashUtils.compare(password, user.password))) {
      this.logger.log(`Email or password not correct or user does not exist`);

      throw new BadRequestException('Email or password not correct');
    }

    return user;
  }
}
