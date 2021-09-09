import { Injectable, Param } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { UsersService } from 'src/users/users.service';

const { user, friendship, channel } = new PrismaClient();
@Injectable()
export default class AdminService {
  constructor(private readonly userservice: UsersService) {}
  async send_message(b) {
    try {
      const u = await user.findUnique({
        where: {
          username: b.username,
        },
      });
      const n_u = await user.findUnique({
        where: {
          username: b.user,
        },
      });
      if (!n_u || !u)
        return {
          id: -1,
        };
      const f = await friendship.create({
        data: {
          user1: u.id,
          user2: n_u.id,
          status: true,
        },
      });
      if (!f)
        return {
          id: 1,
          message: 'friend',
        };
      // for (let index = 0; index < u.friends.length; index++) {
      //     if (u.friends[index] == n_u.id)
      //         return {
      //             id: u.id
      //         }
      // }
      let u_val = u.friends;
      let n_u_val = n_u.friends;

      u_val.push(f.id);
      n_u_val.push(f.id);
      const ret = await user.update({
        where: {
          id: u.id,
        },
        data: {
          friends: u_val,
        },
      });

      const ret1 = await user.update({
        where: {
          id: n_u.id,
        },
        data: {
          friends: n_u_val,
        },
      });
      if (!ret || !ret1)
        return {
          id: -1,
        };
      return {
        id: ret1.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
        message: error.message,
      };
    }
  }

  async remove_user(b) {
    try {
      const val = await user.delete({
        where: {
          username: b.username,
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

  async change_xp(b) {
    try {
      const u = await user.findUnique({
        where: {
          username: b.username,
        },
      });
      if (!u)
        return {
          id: -1,
        };
      const v = await this.userservice.change_xp(u.id, b.xp);
      if (v.id >= 0) {
        const u_u = await user.update({
          where: {
            id: u.id,
          },
          data: {
            num_wins: u.num_wins,
            num_loss: u.num_loss,
          },
        });
        if (!u_u)
          return {
            id: -1,
          };
        return {
          id: u_u.id,
        };
      }
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

  async change_title(b) {
    try {
      const val = await user.update({
        where: {
          username: b.username,
        },
        data: {
          title: b.title,
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

  async reset_password(b) {
    try {
      return this.userservice.change_password(b);
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async access_channel(b) {
    try {
      const c = await channel.findUnique({
        where: {
          name: b.channel,
        },
      });
      if (!c)
        return {
          id: -1,
        };
      return {
        id: c.id,
        status: c.status,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async remove_mod(b) {
    try {
      const u = await user.findUnique({
        where: {
          username: b.username,
        },
      });
      if (u.owner)
        return {
          id: -1,
          message: 'owner',
        };
      const val = await user.update({
        where: {
          username: b.username,
        },
        data: {
          admin_op: false,
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

  async add_mod(b) {
    try {
      const uId = await this.userservice.get_user_id(b.username);
      if (uId <= 0)
        return {
          id: -1,
          message: 'user',
        };
      const u_f = await user.findUnique({
        where: {
          username: b.username,
        },
      });
      if (!u_f)
        return {
          id: -1,
        };
      if (u_f.admin_op)
        return {
          id: -1,
          message: 'mod',
        };
      const u = await user.update({
        where: {
          username: b.username,
        },
        data: {
          admin_op: true,
        },
      });
      if (!u)
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
}
