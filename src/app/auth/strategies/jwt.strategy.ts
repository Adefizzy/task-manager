import { config } from '@app/config';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserService } from '@app/app/user/user.service';
import { JwtPayload } from '../auth.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findOne({
      email: payload.email,
      id: payload.sub,
    });
    if (!user) {
      throw new ForbiddenException('Invalid access token');
    }
    return user;
  }
}
