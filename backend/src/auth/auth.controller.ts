import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaClient } from '.prisma/client';
import inputValidation from 'src/inputValidation/inputValidation.service';
const JWT = require('jsonwebtoken');
const { user } = new PrismaClient();

@Controller()
export class AuthController {
  constructor(
    private readonly authservice: AuthService,
    private readonly inputvalidation: inputValidation,
  ) {}

  @Get('/auth_link')
  get_intra_link() {
    return this.authservice.get_intra_link();
  }

  @Post('/auth_user')
  Verify_User(@Body() b) {
    return this.authservice.verify_user(b);
  }

  @Post('/access')
  async Have_Access(@Body() b) {
    let user_logged = true;
    const { token, url } = b.data;
    try {
      let valid = await JWT.verify(token, process.env.JWT_SECRET);
      const username = valid.username;
      const ret = await user.findUnique({
        where: {
          username: username,
        },
      });
      let auth = false;
      if (
        (!ret.auth_code || ret.auth_code.length <= 0) &&
        ret.factory_auth &&
        b.data.red == 'red'
      ) {
        const v = await this.authservice.send_auth(ret);
        if (v.id >= 0) {
          user_logged = false;
          auth = true;
        }
      }
      if (ret.auth_code) {
        user_logged = false;
        auth = true;
      }
      if (!ret) return { id: -1 };
      if (ret.factory_auth && ret.auth_code) auth = true;
      return {
        id: ret.id,
        user: ret.username,
        avatar: ret.avatar,
        xp: ret.rating,
        auth,
        user_logged,
      };
    } catch (error) {
      console.log(error.message);
      return { id: -1 };
    }
  }

  @Post('/user/validauth')
  valid_auth(@Body() b) {
    return this.authservice.valid_auth(b.data);
  }

  @Post('/user/auth')
  auth_user(@Body() b) {
    try {
      if (
        this.inputvalidation.emailValidation(b.data.email) &&
        this.inputvalidation.passwordValidation(b.data.password)
      )
        return this.authservice.auth_user(b.data);
      return {
        id: -1,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  @Post('/user/2-auth')
  auth_val_user(@Body() b) {
    return this.authservice.auth_val_user(b.data);
  }

  @Post('/send/auth')
  send_auth(@Body() b) {
    return this.authservice.send_auth(b.data);
  }

  @Post('/user/deactivateauth')
  deactivate_auth(@Body() b) {
    return this.authservice.deactivate_auth(b.data);
  }
}
