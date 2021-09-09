import { MessageGateway } from './../gateway/message.gateway';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { v4 as uuidv4 } from 'uuid';
const { user, match } = new PrismaClient();

@Injectable()
export default class MatchService {
  constructor(
    private readonly userservice: UsersService,
    private readonly messagegateway: MessageGateway,
  ) {}

  async get_user_matches(username) {
    try {
      const u = await user.findUnique({
        where: {
          username,
        },
      });
      if (!u)
        return {
          id: -1,
        };
      const m_tab = u.matches;
      if (m_tab.length == 0)
        return {
          id: -1,
        };
      let all_m = [{}];
      for (let index = 0; index < m_tab.length; index++) {
        const ms = await match.findUnique({
          where: {
            id: m_tab[index],
          },
        });
        if (ms && ms.winner != 0) {
          let u1 = await this.userservice.get_user_username(ms.player1);
          let u2 = await this.userservice.get_user_username(ms.player2);
          if (u1.length <= 0 || u2.length <= 0) continue;
          all_m.push({
            ...ms,
            player1: u1,
            player2: u2,
            p1Id: ms.player1,
            p2Id: ms.player2,
          });
        }
      }
      return {
        id: u.id,
        data: all_m,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async create_match(b) {
    try {
      if (b.data.player1 == b.data.player2)
        return {
          id: -1,
          message:"same"
        }
      const p1 = await user.findUnique({
        where: {
          username: b.data.player1,
        },
      });
      const p2 = await user.findUnique({
        where: {
          username: b.data.player2,
        },
      });
      const gameId = uuidv4();
      if (!p1 || !p2 || p1.id < 0 || p2.id < 0)
        return {
          id: -1,
          message: 'user',
        };
      if (p1.rating < b.data.reward || p2.rating < b.data.reward)
        return {
          id: -1,
          message: 'xp',
        };
      const m = await match.create({
        data: {
          player1: p1.id,
          player2: p2.id,
          winner: 0,
          type: b.data.type,
          arena: b.data.arena,
          reward: b.data.reward,
          round: parseInt(b.data.rounds),
          title: b.data.title,
          gameId,
        },
      });
      if (!m)
        return {
          id: -1,
        };
      let res = await user.findUnique({
        where: {
          id: p1.id,
        },
        select: {
          matches: true,
        },
      });
      let u_u = await user.update({
        where: {
          id: p1.id,
        },
        data: {
          matches: {
            set: [...res.matches, m.id],
          },
        },
      });
      if (!res || !u_u)
        return {
          id: -1,
        };
      res = await user.findUnique({
        where: {
          id: p2.id,
        },
        select: {
          matches: true,
        },
      });
      u_u = await user.update({
        where: {
          id: p2.id,
        },
        data: {
          matches: {
            set: [...res.matches, m.id],
          },
        },
      });
      if (!res || !u_u)
        return {
          id: -1,
        };
      return {
        id: m.id,
        gameId: m.gameId,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async random_match(b) {
    try {
      const mas = await match.findFirst({
        where: {
          random: true,
        },
      });
      if (!mas) {
        const u1 = await user.findUnique({
          where: {
            username: b.player1,
          },
        });
        if (u1.rating < b.reward)
          return {
            id: -1,
            message: 'xp',
          };
        let p1 = await this.userservice.get_user_id(b.player1);
        const gameId = uuidv4();
        const n_match = await match.create({
          data: {
            player1: p1,
            player2: 0,
            winner: 0,
            type: b.type,
            arena: b.arena,
            reward: b.reward,
            round: parseInt(b.rounds),
            title: b.title,
            gameId,
            random: true,
          },
        });
        if (!n_match)
          return {
            id: -1,
          };
        return {
          id: n_match.id,
          gameId,
          on: false,
        };
      } else {
        let p2 = await this.userservice.get_user_id(b.player1);
        const u2 = await user.findUnique({
          where: {
            id: p2,
          },
        });
        if (mas.player1 == p2)
          return {
            id: -1,
            message: "match"
          }
        if (u2.rating < mas.reward)
          return {
            id: -1,
            message: 'xp',
          };
        const up_match = await match.update({
          where: {
            id: mas.id,
          },
          data: {
            player2: p2,
            random: false,
            live: true,
          },
        });
        if (!up_match)
          return {
            id: -1,
          };
        let res = await user.findUnique({
          where: {
            id: up_match.player1,
          },
          select: {
            matches: true,
          },
        });
        let u_u = await user.update({
          where: {
            id: up_match.player1,
          },
          data: {
            matches: {
              set: [...res.matches, up_match.id],
            },
          },
        });
        if (!res || !u_u)
          return {
            id: -1,
          };
        res = await user.findUnique({
          where: {
            id: up_match.player2,
          },
          select: {
            matches: true,
          },
        });
        u_u = await user.update({
          where: {
            id: up_match.player2,
          },
          data: {
            matches: {
              set: [...res.matches, up_match.id],
            },
          },
        });
        if (!res || !u_u)
          return {
            id: -1,
          };
        await this.messagegateway.accept_game(null, {
          data: {
            ...up_match,
            rounds: up_match.round,
            player1: await this.userservice.get_user_username(up_match.player1),
            player2: u_u.username,
          },
        });
        return {
          id: up_match.id,
          gameId: up_match.gameId,
          on: true,
        };
      }
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }
}
