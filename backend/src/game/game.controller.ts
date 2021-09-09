import { UsersService } from 'src/users/users.service';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import GameService from './game.service';
import { PrismaClient } from '.prisma/client';
const { user } = new PrismaClient();

@Controller()
export default class GameController {
  constructor(
    private readonly gameservice: GameService,
    private readonly userservice: UsersService,
  ) {}

  @Get('/live_game')
  get_live_games() {
    return this.gameservice.get_live_games();
  }

  @Get('/game/:id')
  get_game_info(@Param('id') gameId) {
    return this.gameservice.get_game_info(gameId);
  }

  @Post('/game/live')
  live_game(@Body() b) {
    return this.gameservice.live_game(b.data);
  }

  @Post('/game/cancel')
  cancel_game(@Body() b)
  {
      return this.gameservice.cancel_game(b.data)
  }

  @Post('/game/powerups')
  async charge_powerups(@Body() b) {
    try {
      const u = await user.findUnique({
        where: {
          username: b.data.username,
        },
      });
      if (!u || b.data.base_xp + b.data.xp > u.rating)
        return {
          id: -1,
        };
      return this.userservice.change_xp(u.id, -1 * b.data.xp);
    } catch (error) {
        console.log(error.message)
      return {
        id: -1,
      };
    }
  }
}
