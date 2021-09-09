import { Injectable } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { userInfo } from 'os';
import MessageService from 'src/message/message.service';
const { user, friendship } = new PrismaClient();

@Injectable()
export default class FriendsService {
  constructor(private readonly messageservice: MessageService) {}
  async get_friends(username) {
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
      const frs = u.friends;
      let ret = [];
      if (frs.length == 0) return;
      for (let index = 0; index < frs.length; index++) {
        const f = await friendship.findUnique({
          where: {
            id: frs[index],
          },
        });
        if (!f) continue;
        if (!f.status) continue;
        let nm;
        if (f.user1 != u.id) nm = f.user1;
        else nm = f.user2;
        const f1 = await user.findUnique({
          where: {
            id: nm,
          },
        });
        if (!f1) continue;
        const c = await this.messageservice.get_unread(u.id, f1.id);

        const v1 = c.id < 0 ? 0 : c.count;
        ret.push({
          username: f1.username,
          title: f1.title,
          status: f1.status,
          avatar: f1.avatar,
          message_c: v1,
          gameId: f1.inGame,
        });
      }

      return {
        id: u.id,
        friends: ret,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async create_friend_request(username, friend) {
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
      const f1 = await friendship.findFirst({
        where: {
          user1: friend,
          user2: u.id,
        },
      });
      if (f1 && f1.id > 0)
        return {
          id: -1,
          message: 'user',
        };
      const fs = await friendship.create({
        data: {
          user1: u.id,
          user2: friend,
        },
      });
      if (!fs)
        return {
          id: -1,
        };
      return {
        id: fs.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async get_friends_request(username) {
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
      const fs = await friendship.findMany({
        where: {
          OR: [
            {
              status: false,
              user2: u.id,
            },
            {
              status: false,
              user1: u.id,
            },
          ],
        },
      });
      let ret = [];
      for (let index = 0; index < fs.length; index++) {
        const u1_num = fs[index].user1;
        const u1 = await user.findUnique({
          where: {
            id: fs[index].user1,
          },
        });
        const u2 = await user.findUnique({
          where: {
            id: fs[index].user2,
          },
        });
        ret.push({
          id: fs[index].id,
          user1: u1.username,
          user2: u2.username,
          avatar1: u1.avatar,
          avatar2: u2.avatar,
        });
      }
      return ret;
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async delete_friends_request(id) {
    try {
      const val = await friendship.delete({
        where: {
          id,
        },
      });
      if (!val || val.id <= 0)
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

  async add_fr(id, u) {
    try {
      const u1 = await user.findUnique({
        where: {
          id: u,
        },
      });
      if (!u1) return;
      let fs = u1.friends;
      const u2 = await user.update({
        where: {
          id: u,
        },
        data: {
          friends: {
            set: [...fs, id],
          },
        },
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  async accept_friend(id) {
    try {
      const val = await friendship.update({
        where: {
          id: id,
        },
        data: {
          status: true,
        },
      });
      if (!val)
        return {
          id: -1,
        };
      await this.add_fr(val.id, val.user1);
      await this.add_fr(val.id, val.user2);
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }
}
