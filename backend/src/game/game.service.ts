import { Injectable } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { UsersService } from 'src/users/users.service';
const { user, match } = new PrismaClient();

@Injectable()
export default class GameService {
  constructor(private readonly userservice: UsersService) {}
  async get_live_games() {
    let ret = [];
    try {
      const val = await match.findMany();
      if (!val)
        return {
          id: -1,
        };
      for (let index = 0; index < val.length; index++) {
        if (val[index].live) {
          ret.push({
            gameId: val[index].gameId,
            p1: await this.userservice.get_user_username(val[index].player1),
            p2: await this.userservice.get_user_username(val[index].player2),
          });
        }
      }
      return {
        id: 1,
        games: ret,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async get_game_info(gameId) {
    try {
      const m = await match.findFirst({
        where: {
          gameId: gameId,
        },
      });
      if (!m)
        return {
          id: -1,
        };
      let p1 = await this.userservice.get_user_username(m.player1);
      let p2 = await this.userservice.get_user_username(m.player2);
      if (!p1 || !p2)
        return {
          id: -1,
        };
      return {
        id: m.id,
        player1: p1,
        player2: p2,
        type: m.type,
        round: m.round,
        arena: m.arena,
        winner: await this.userservice.get_user_username(m.winner),
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async live_game(b) {
    try {
      const g = await match.update({
        where: {
          gameId: b.gameId,
        },
        data: {
          live: true,
        },
      });
      if (!g)
        return {
          id: -1,
        };
      return {
        id: g.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async game_end(game) {
    try {
      let v = '';
      if (game.player1.score > game.player2.score) v = game.player1.name;
      else v = game.player2.name;
      const p1 = await this.userservice.get_user_id(v);
      let p2;
      const val = await match.update({
        where: {
          gameId: game.gameId,
        },
        data: {
          winner: p1,
          live: false,
        },
      });
      if (p1 != val.player1) p2 = val.player1;
      else p2 = val.player2;
      if (val.type == 'Title') {
        await this.userservice.change_xp(p1, val.reward);
        await this.userservice.change_xp(p2, -1 * val.reward);
        await this.userservice.change_title_game(p2, val.title);
      } else {
        await this.userservice.change_xp(p1, val.reward);
        if (val.reward == 0) await this.userservice.add_win(p1);
        await this.userservice.change_xp(p2, -1 * val.reward);
        if (val.reward == 0) await this.userservice.add_loss(p2);
      }
      return {
        id: val.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async cancel_game(b) {
    try {
      const val = await match.delete({
        where: {
          gameId: b.gameId,
        },
      });
      if (!val)
        return {
          id: -1,
        };
      return {
        id: val.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }
}
