import { Body, Controller, Delete, Post } from '@nestjs/common';
import AdminService from './admin.service';

@Controller()
export default class AdminController {
  constructor(private readonly adminservice: AdminService) {}

  @Post('/admin/send_message')
  send_message(@Body() b) {
    return this.adminservice.send_message(b.data);
  }

  @Delete('/admin/remove_user')
  remove_user(@Body() b) {
    return this.adminservice.remove_user(b);
  }

  @Post('/admin/remove_mod')
  remove_mod(@Body() b) {
    return this.adminservice.remove_mod(b.data);
  }

  @Post('/admin/mod')
  add_mod(@Body() b) {
    return this.adminservice.add_mod(b.data);
  }

  @Post('/admin/change_xp')
  change_xp(@Body() b) {
    return this.adminservice.change_xp(b.data);
  }

  @Post('/admin/change_title')
  change_title(@Body() b) {
    return this.adminservice.change_title(b.data);
  }

  @Post('/admin/change_pass')
  reset_password(@Body() b) {
    return this.adminservice.reset_password(b.data);
  }

  @Post('/admin/access_channel')
  access_channel(@Body() b) {
    return this.adminservice.access_channel(b.data);
  }
}
