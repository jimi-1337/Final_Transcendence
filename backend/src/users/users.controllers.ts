import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import inputValidation from 'src/inputValidation/inputValidation.service';
import { UsersService } from './users.service';

@Controller()
export default class UsersController {
  constructor(
    private readonly usersservice: UsersService,
    private readonly inputvalidation: inputValidation,
  ) {}

  @Post('/create_user')
  create_user(@Body() b) {
    return this.usersservice.create_user(b);
  }
  @Post('/login')
  user_login(@Body() b) {
    const { username, password } = b;
    if (
      this.inputvalidation.usernameValidation(username) &&
      this.inputvalidation.passwordValidation(password)
    )
      return this.usersservice.user_login(b);
    return {
      id: -1,
      error: 'Bad Info',
      username: undefined,
      token: undefined,
    };
  }

  @Post('/change_password')
  change_password(@Body() b) {
    return this.usersservice.change_password(b);
  }

  @Post('/upload/:user')
  @UseInterceptors(
    FileInterceptor('myfile', {
      dest: './public/uploads',
    }),
  )
  uploadingfiles(@UploadedFile() file, @Param('user') username) {
    const filename = file.filename;
    return this.usersservice.change_photo({ filename, username });
  }

  @Post('/change_username')
  change_username(@Body() b) {
    if (this.inputvalidation.usernameValidation(b.data.displayname))
      return this.usersservice.change_username(b);
    return {
      id: -1,
    };
  }

  @Delete('/delete_user')
  delete_user(@Body() b) {
    return this.usersservice.delete_user(b.username, b.password);
  }

  @Post('/block/:user')
  block_user(@Param('user') b_user, @Body() b) {
    const username = b.data.username;
    return this.usersservice.block_user(b_user, username);
  }

  @Post('/change_title')
  change_title(@Body() b) {
    try {
      const title = b.data.title;
      if (!this.inputvalidation.titleValidation(title))
        return {
          id: -1,
        };
      return this.usersservice.change_title(b.data.user, b.data.title);
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  @Post('/user/info')
  get_user_info(@Body() b) {
    return this.usersservice.get_user_info(b.data);
  }
}
