import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {json, Request} from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UsersService,
    readonly config: ConfigService
  ) {
    super({
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWTSECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        var data = request?.cookies['auth-cookie'];
        if(data == null){
            return null;
        }
        ;
        return data;
      }]),
    });
  }

  async validate(payload:any){
    
    const user = await this.userService.findOne( payload.userId );
    if ( user == undefined) throw new UnauthorizedException();
		if ( user.activated2FA != payload.isTwoFaAuth) throw new UnauthorizedException();
		return user;
  }

}