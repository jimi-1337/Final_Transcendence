import { Injectable } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import FriendsService from 'src/friends/friends.service';
import { UsersService } from 'src/users/users.service';
const { user, channel, match } = new PrismaClient();

@Injectable()
export default class SearchService {
  constructor(
    private readonly friendsservice: FriendsService,
    private readonly userservice: UsersService,
  ) {}
  async get_search_elems() {
    var ret = [];
    try {
      var users = await user.findMany();
      var channels = await channel.findMany();
      for (let index = 0; index < users.length; index++) {
        ret.push({
          id: users[index].id,
          type: 'user',
          name: users[index].username + ' - User',
          username: users[index].username,
          avatar: users[index].avatar,
          xp: users[index].rating,
        });
      }
      for (let index = 0; index < users.length; index++) {
        if (users[index].admin_op)
          ret.push({
            id: users[index].id,
            type: 'user',
            name: users[index].username + ' - Admin',
            username: users[index].username,
            avatar: users[index].avatar,
          });
      }
      for (let index = 0; index < channels.length; index++) {
        ret.push({
          id: channels[index].id,
          type: 'channel',
          name: channels[index].name + ' - Channel',
          username: channels[index].name,
        });
      }
      return ret;
    } catch (error) {
      return ret;
    }
  }

  async get_search_mods() {
    var ret = [];
    try {
      var users = await user.findMany();
      for (let index = 0; index < users.length; index++) {
        if (users[index].admin_op)
          ret.push({
            id: users[index].id,
            type: 'mod',
            name: users[index].username + ' - User',
            username: users[index].username,
            avatar: users[index].avatar,
            xp: users[index].rating,
          });
      }
      return ret;
    } catch (error) {
      return ret;
    }
  }

  async get_user_data(username, me) {
    let fr = false;
    let bl = false;
    let me_blocked = false;
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
      let winrate = (u.num_wins * 100) / (u.num_wins + u.num_loss);

      let lastmatch;
      if (u.matches.length === 0) lastmatch = 'No Matches Yet';
      else {
        const num = u.matches[u.matches.length - 1];
        const m = await match.findUnique({
          where: {
            id: num,
          },
        });
        if (!m) lastmatch = 'No Matches Yet';
        else {
          let user1 = await this.userservice.get_user_username(m.player1);
          let user2 = await this.userservice.get_user_username(m.player2);
          if (user1.length == 0) user1 = 'USER';
          if (user2.length == 0) user2 = 'USER';
          lastmatch = user1 + ' VS ' + user2;
        }
      }
      if (!winrate && !u.num_loss) winrate = 100;
      var n = winrate.toFixed(2);
      const v1 = await this.friendsservice.get_friends(u.username);
      if (v1 && v1.friends && v1.friends.length > 0)
        v1.friends.map((f) => {
          if (f.username == me) fr = true;
        });
      const my_id = await this.userservice.get_user_id(me);
      if (my_id > 0)
        u.blocked.map((b) => {
          if (b == my_id) bl = true;
        });
      const v2 = await user.findUnique({
        where: {
          username: me,
        },
      });
      if (v2.blocked.length > 0)
        v2.blocked.map((b) => {
          if (b == u.id) me_blocked = true;
        });
      return {
        id: u.id,
        username: u.username,
        num_wins: u.num_wins,
        num_loss: u.num_loss,
        ladder_level: u.ladder_level,
        num_won_tournaments: u.num_won_tournaments,
        avatar: u.avatar,
        status: u.status,
        xp: u.rating,
        title: u.title,
        email: u.email,
        ladder: u.ladder_level,
        campus: u.campus,
        country: u.country,
        time_zone: u.time_zone,
        first_name: u.first_name,
        last_name: u.last_name,
        admin: u.admin_op,
        createdAt: u.createdAt.toDateString(),
        winrate: n,
        level: u.ladder_level,
        lastmatch,
        fr,
        bl,
        me_blocked,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }
}
