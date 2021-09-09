import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import inputValidation from 'src/inputValidation/inputValidation.service';
import MatchService from './match.service';

@Controller()
export default class MatchController {
  constructor(
    private readonly matchservice: MatchService,
    private readonly inputvalidation: inputValidation,
  ) {}

  @Get('/match/:user')
  get_user_matches(@Param('user') user) {
    return this.matchservice.get_user_matches(user);
  }

  @Post('/create_match')
  create_match(@Body() b) {
    const { player1, player2 } = b.data;
    if (
      !this.inputvalidation.usernameValidation(player1) ||
      !this.inputvalidation.usernameValidation(player2)
    )
      return {
        id: -1,
      };
    return this.matchservice.create_match(b);
  }

  @Post('/match/random')
  random_match(@Body() b) {
    if (this.inputvalidation.usernameValidation(b.data.player1))
      return this.matchservice.random_match(b.data);
    return {
      id: -1,
    };
  }
}
