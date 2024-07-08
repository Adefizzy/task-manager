import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  async login(@GetUser() user: User) {
    return await this.authService.login(user);
  }

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.registerUser(createUserDto);
  }
}
