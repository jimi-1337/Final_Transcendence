import { userInfo } from 'os';
import { UsersService } from './../users/users.service';
import { Injectable, Param } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { MessageGateway } from 'src/gateway/message.gateway';
const { user, channel, messsage } = new PrismaClient();
const bcrypt = require('bcryptjs');

@Injectable()
export default class ChannelService {
  constructor(
    private readonly userservice: UsersService,
    private readonly messagegatway: MessageGateway,
  ) {}
  async create_channel(b) {
    const { username, channelname, password, passwordg, p_ex } = b.data;

    try {
      const u = await user.findUnique({
        where: {
          username: username,
        },
      });
      const c = await channel.findUnique({
        where: {
          name: channelname,
        },
      });
      if (!c) {
        var by_pass;
        if (p_ex) by_pass = await bcrypt.hash(password, 10);
        if (p_ex) {
          const c_c = await channel.create({
            data: {
              name: channelname,
              password: by_pass,
              status: 'private',
              admin: u.id,
              users: [u.id],
              owner: u.id,
            },
          });
          if (!c_c)
            return {
              id: -1,
              error: 'channel create',
            };
        } else {
          const c_c = await channel.create({
            data: {
              name: channelname,
              status: 'public',
              admin: u.id,
              owner: u.id,
            },
          });
          if (!c_c)
            return {
              id: -1,
              error: 'channel create',
            };
        }
        return {
          id: u.id,
          name: channelname,
        };
      } else
        return {
          id: -1,
          error: 'Channel Exist',
        };
    } catch (error) {
      return {
        id: -1,
        error: error.message,
      };
    }
  }

  async get_channels() {
    var ret = [];

    try {
      const val = await channel.findMany();
      if (!val) return ret;
      val.map((c) => {
        ret.push({
          name: c.name,
          type: c.status,
        });
      });
      return ret;
    } catch (error) {
      return ret;
    }
  }

  async get_channel_messages(msg) {
    let ret = [];
    try {
      for (let index = 0; index < msg.length; index++) {
        const m = await messsage.findUnique({
          where: {
            id: msg[index],
          },
        });
        if (!m) continue;
        const u = await user.findUnique({
          where: {
            id: m.sender,
          },
        });
        if (!u) continue;
        ret.push({
          message: m.message,
          date: m.createdAt,
          sender: u.username,
          sender_avatar: u.avatar,
          admin: u.admin_op,
        });
      }
      return {
        id: 1,
        messages: ret,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }
  async get_channel(p) {
    let allowed = 'public';
    let ret = { id: -1, admin: false, allowed: false, siteadmin: false };
    if (p.pv) allowed = 'private';
    try {
      const u_ad = await user.findUnique({
        where: {
          username: p.username,
        },
      });
      if (!u_ad)
        return {
          id: -1,
        };
      const val = await channel.findMany({
        where: {
          name: p.channel,
          status: allowed,
        },
      });
      const u = await this.userservice.get_user_id(p.username);
      if (!val || u < 0)
        return {
          id: -1,
        };
      for (let index = 0; index < val[0].banned.length; index++) {
        if (val[0].banned[index] == u) {
          return {
            id: -1,
            message: 'banned',
          };
        }
      }
      for (let index = 0; index < val[0].admin.length; index++) {
        if (val[0].admin[index] == u) ret.admin = true;
      }
      if (allowed == 'private') {
        const c_users = val[0].users;
        for (let index = 0; index < c_users.length; index++) {
          if (c_users[index] == u) {
            ret.allowed = true;
            break;
          }
        }
      } else ret.allowed = true;
      if (u_ad.admin_op) ret.allowed = true;
      const messages = await this.get_channel_messages(val[0].messages);
      if (messages.id < 0)
        return {
          id: -1,
        };
      ret.id = 1;
      const u_ban = await user.findUnique({
        where: {
          id: u,
        },
      });
      if (u_ban.admin_op) ret.siteadmin = true;
      for (let index = 0; index < u_ban.blocked.length; index++) {
        const b_u = await this.userservice.get_user_username(
          u_ban.blocked[index],
        );
        for (let index = 0; index < messages.messages.length; index++) {
          if (messages.messages[index].sender == b_u) {
            messages.messages.splice(index, 1);
            index--;
          }
        }
      }
      return {
        id: 1,
        messages,
        ret,
        owner: await this.userservice.get_user_username(val[0].owner),
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async channel_access(b) {
    try {
      const c = await channel.findUnique({
        where: {
          name: b.name,
        },
      });
      if (!c)
        return {
          id: -1,
        };
      const ret = await bcrypt.compare(b.pass, c.password);
      const u = await this.userservice.get_user_id(b.username);
      if (!ret || u < 0)
        return {
          id: -1,
        };
      const v = await channel.update({
        where: {
          name: b.name,
        },
        data: {
          users: {
            set: [...c.users, u],
          },
        },
      });
      if (!v)
        return {
          id: -1,
        };
      return {
        id: 1,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async channel_message(b) {
    try {
      const u = await this.userservice.get_user_id(b.username);
      const c = await channel.findUnique({
        where: {
          name: b.name,
        },
      });
      if (!c || u < 0)
        return {
          id: -1,
        };
      var muts = c.muted;
      var rel = c.release;
      let in_user = 0;
      if (c.status == 'private') {
        for (let index = 0; index < c.users.length; index++) {
          if (c.users[index] == u) in_user = 1;
        }
        if (in_user == 0)
          return {
            id: -1,
            message: 'out',
          };
      }
      for (let index = 0; index < c.muted.length; index++) {
        if (
          c.muted[index] == u &&
          Math.round(new Date().getTime() / 1000) > c.release[index]
        ) {
          muts.splice(index, 1);
          rel.splice(index, 1);
          index = 0;
        } else if (c.muted[index] == u) {
          return {
            id: -1,
            message: 'muted',
          };
        }
      }
      for (let index = 0; index < c.banned.length; index++) {
        if (c.banned[index] == u)
          return {
            id: -1,
            message: 'ban',
          };
      }
      const msg = await messsage.create({
        data: {
          message: b.message,
          sender: u,
          receiver: 0,
        },
      });
      if (!msg)
        return {
          id: -1,
        };
      const u_c = await channel.update({
        where: {
          name: b.name,
        },
        data: {
          messages: {
            set: [...c.messages, msg.id],
          },
          muted: muts,
          release: rel,
        },
      });
      if (!u_c)
        return {
          id: -1,
        };

      this.messagegatway.send_to_room(u_c.name, b.username);
      return {
        id: 1,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async mute_user(b) {
    try {
      const val = await channel.findUnique({
        where: {
          name: b.name,
        },
      });
      if (!val)
        return {
          id: -1,
        };
      const uId = await this.userservice.get_user_id(b.username);
      const up = await channel.update({
        where: {
          name: b.name,
        },
        data: {
          muted: {
            set: [...val.muted, uId],
          },
          release: {
            set: [...val.release, b.release],
          },
        },
      });
      if (!up)
        return {
          id: -1,
        };
      return {
        id: up.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async ban_user(b) {
    try {
      const c = await channel.findUnique({
        where: {
          name: b.name,
        },
      });
      const uId = await this.userservice.get_user_id(b.username);
      if (uId < 0 || !c)
        return {
          id: -1,
        };
      let b_users = c.banned;
      let us = c.users;
      for (let index = 0; index < c.users.length; index++) {
        if (c.users[index] == uId) {
          us.splice(index, 1);
          break;
        }
      }
      const up = await channel.update({
        where: {
          name: b.name,
        },
        data: {
          users: us,
          banned: {
            set: [...b_users, uId],
          },
        },
      });
      if (!up)
        return {
          id: -1,
        };
      return {
        id: up.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async show_ban_user(b) {
    let ret = [];
    try {
      const c = await channel.findUnique({
        where: {
          name: b.name,
        },
      });
      if (!c)
        return {
          id: -1,
        };
      for (let index = 0; index < c.banned.length; index++) {
        const element = await this.userservice.get_user_username(
          c.banned[index],
        );
        if (element)
          ret.push({
            username: element,
          });
      }
      return {
        id: 1,
        users: ret,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async unban_user(b) {
    try {
      const c = await channel.findUnique({
        where: {
          name: b.name,
        },
      });
      const uId = await this.userservice.get_user_id(b.username);
      if (uId < 0 || !c)
        return {
          id: -1,
        };
      let ban_users = c.banned;
      for (let index = 0; index < ban_users.length; index++) {
        if (ban_users[index] == uId) {
          ban_users.splice(index, 1);
          break;
        }
      }
      const up = await channel.update({
        where: {
          name: b.name,
        },
        data: {
          banned: ban_users,
        },
      });
      if (!up)
        return {
          id: -1,
        };
      return {
        id: up.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async change_password(b) {
    try {
      const c = await channel.findUnique({
        where: {
          name: b.name,
        },
      });
      if (!c)
        return {
          id: -1,
        };
      const r = await bcrypt.compare(b.old_p, c.password);
      if (!r)
        return {
          id: -1,
          message: 'wrong',
        };
      const h_pass = await bcrypt.hash(b.pass, 10);
      if (!h_pass)
        return {
          id: -1,
        };
      const up = await channel.update({
        where: {
          name: b.name,
        },
        data: {
          password: h_pass,
          users: c.admin,
        },
      });
      if (!up)
        return {
          id: -1,
        };
      return {
        id: up.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async channel_status(b) {
    try {
      let ty;
      let ret = [];
      let pass = null;
      const val = await channel.findUnique({
        where: {
          name: b.name,
        },
      });
      if (!val)
        return {
          id: -1,
        };
      if (b.status == 'Public') ty = 'public';
      else ty = 'private';

      if (ty == 'private') {
        const h_pass = await bcrypt.hash(b.password, 10);
        if (!h_pass)
          return {
            id: -1,
          };
        pass = h_pass;
      }
      const u = await channel.update({
        where: {
          name: b.name,
        },
        data: {
          status: ty,
          password: pass,
          users: val.admin,
        },
      });
      if (!u)
        return {
          id: -1,
        };
      return {
        id: u.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async add_admin(b) {
    try {
      const c = await channel.findUnique({
        where: {
          name: b.name,
        },
      });
      const uId = await this.userservice.get_user_id(b.username);
      if (!c)
        return {
          id: -1,
        };
      if (uId < 0)
        return {
          id: -1,
          message: 'user',
        };
      for (let index = 0; index < c.admin.length; index++) {
        if (c.admin[index] == uId)
          return {
            id: -1,
            message: 'admin',
          };
      }
      for (let index = 0; index < c.banned.length; index++) {
        if (c.banned[index] == uId)
          return {
            id: -1,
            message: 'banned',
          };
      }
      let c_users = c.users;
      c_users.push(uId);
      let ret_users = Array.from(new Set(c_users));
      const up = await channel.update({
        where: {
          name: b.name,
        },
        data: {
          admin: {
            set: [...c.admin, uId],
          },
          users: ret_users,
        },
      });
      if (!up)
        return {
          id: -1,
        };
      return {
        id: up.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async leave_channel(b) {
    try {
      const c = await channel.findUnique({
        where: {
          name: b.name,
        },
      });
      const uId = await this.userservice.get_user_id(b.username);
      if (uId < 0 || !c)
        return {
          id: -1,
        };
      if (c.admin.length == 1 && c.admin[0] == uId) {
        return {
          id: -1,
          message: 'admin',
        };
      }
      let c_users = c.users;
      let c_admin = c.admin;
      c_users = this.userservice.remove_elem_array(c_users, uId);
      c_admin = this.userservice.remove_elem_array(c_admin, uId);
      const up = await channel.update({
        where: {
          name: b.name,
        },
        data: {
          users: c_users,
          admin: c_admin,
        },
      });
      if (!up)
        return {
          id: -1,
        };
      return {
        id: up.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async delete_channel(b) {
    try {
      const c = await channel.findUnique({
        where: {
          name: b.name,
        },
      });
      const d_c = await channel.delete({
        where: {
          name: b.name,
        },
      });
      if (!d_c)
        return {
          id: -1,
        };
      const c_msg = c.messages;
      for (let index = 0; index < c_msg.length; index++) {
        const d_m = await messsage.delete({
          where: {
            id: c_msg[index],
          },
        });
      }
      return {
        id: 1,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }
}
