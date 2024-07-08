import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtPayload } from './auth.constant';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: Partial<User>) {
    const payload: JwtPayload = { email: user.email, sub: user.id };
    this.logger.log(`logging in user ${user.email}`);

    return {
      user,
      accessToken: this.jwtService.sign(payload, { expiresIn: '30 days' }),
    };
  }

  async validateUser(email: string, password: string) {
    return await this.userService.validateUser(email, password);
  }

  async registerUser(createUserDto: CreateUserDto) {
    const createdUser = await this.userService.create(createUserDto);
    this.logger.log(
      `Registered a new user with the email: ${createUserDto.email}`,
    );

    //TODO: implement and send verification email here

    return {
      user: createdUser,
      accessToken: this.jwtService.sign(
        { email: createdUser.email, sub: createdUser.id },
        { expiresIn: '30 days' },
      ),
    };
  }

  /* 
    TODO: Implement other methods such as 
        1) resetPassword
        2) verifyToken - this will handle the verification of token send via email in the registerUser method.
   */
}
