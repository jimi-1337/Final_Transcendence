import { Injectable, Param } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { randomInt } from 'crypto';
import inputValidation from 'src/inputValidation/inputValidation.service';

const JWT = require('jsonwebtoken');
const { user } = new PrismaClient();
const bcrypt = require('bcryptjs');

const titles = [
  'I’m sick of following my dreams, man. I’m just going to ask where they’re going and hook up with ’em later.',
  'A pessimist is a person who has had to listen to too many optimists.',
  'Better to remain silent and be thought a fool than to speak out and remove all doubt.',
  'If I were two-faced, would I be wearing this one?',
  'The best thing about the future is that it comes one day at a time.',
  'An alcoholic is someone you don’t like who drinks as much as you do.',
  'Light travels faster than sound. This is why some people appear bright until you hear them speak.',
  'The difference between stupidity and genius is that genius has its limits.',
  'War is God’s way of teaching Americans geography.',
  'A bank is a place that will lend you money if you can prove that you don’t need it.',
  'My favorite machine at the gym is the vending machine.',
  'I always arrive late at the office, but I make up for it by leaving early.',
  'Don’t worry about the world coming to an end today. It is already tomorrow in Australia.',
  'A day without laughter is a day wasted.',
  'Remember, today is the tomorrow you worried about yesterday.',
  'The surest sign that intelligent life exists elsewhere in the universe is that it has never tried to contact us.',
  'Whoever said money can’t buy happiness didn’t know where to shop.',
  'All men are equal before fish.',
  'Life is hard. After all, it kills you.',
  'Originality is the fine art of remembering what you hear but forgetting where you heard it.',
  'Age is an issue of mind over matter. If you don’t mind, it doesn’t matter.',
];

@Injectable()
export class UsersService {
  constructor(private readonly inputvalidation: inputValidation) {}
  async user_exist(username) {
    try {
      const val = await user.findUnique({
        where: {
          intra_username: username,
        },
      });
      if (!val) return { id: -1, error: 'No User' };
      return { id: val.id, username: username };
    } catch (error) {
      return { id: -1, error: error.message };
    }
  }
  /* Create User */
  async create_user(b) {
    try {
      const val = await this.user_exist(b.login);
      if (val.id === -1 && val.error === 'No User') {
        try {
          let admin = false;
          const username = b.login;
          const password = await bcrypt.hash(username, 10);
          const email = b.email;
          let title = titles[randomInt(0, titles.length)];
          if (username == 'amoujane') admin = true;
          const ret = await user.create({
            data: {
              username,
              password,
              email,
              intra_username: username,
              num_wins: 0,
              num_loss: 0,
              ladder_level: 0,
              num_won_tournaments: 0,
              avatar: b.image_url,
              status: 'online',
              rating: 100,
              title: title,
              admin_op: admin,
              owner: admin,
              campus: b.campus[0].name,
              country: b.campus[0].country,
              time_zone: b.campus[0].time_zone,
              last_name: b.last_name,
              first_name: b.first_name,
            },
          });
          if (!ret) {
            return { id: -1, error: 'An Error Occcured Try Again Later' };
          } else {
            const token = await JWT.sign({ username }, process.env.JWT_SECRET, {
              expiresIn: 30000,
            });
            return {
              id: ret.id,
              token,
            };
          }
        } catch (error) {
          console.log(error.message);
          return { id: -1, error: error.message };
        }
      } else {
        const u = val.username;
        const user_if = await user.findUnique({
          where: {
            intra_username: u,
          },
        });
        if (!user_if)
          return {
            id: -1,
          };
        const token = await JWT.sign(
          { username: user_if.username },
          process.env.JWT_SECRET,
          {
            expiresIn: 30000,
          },
        );
        if (!token) {
          return { id: -1 };
        }
        return { id: val.id, message: 'User Login', token };
      }
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  /* Read User */
  async user_login(b) {
    const { username, password } = b;
    if (!username || !password)
      return {
        id: -1,
        error: 'Bad Info',
        username: undefined,
        token: undefined,
      };
    try {
      const u = await user.findUnique({
        where: {
          username,
        },
      });
      if (!u) return { id: -1, error: 'Bad Info' };
      const validpass = await bcrypt.compare(password, u.password);
      if (!validpass) return { id: -1, error: 'Bad Info' };
      const token = await JWT.sign({ username }, process.env.JWT_SECRET);
      let auth = false;
      if (u.factory_auth) auth = true;
      return {
        id: u.id,
        username: u.username,
        error: undefined,
        token: token,
        avatar: u.avatar,
        xp: u.rating,
        auth,
      };
    } catch (error) {
      return {
        id: -1,
        error: error.message,
        username: undefined,
        token: undefined,
      };
    }
  }

  /* Update User */
  async change_password(b) {
    const { username, password } = b;
    try {
      const n_pass = await bcrypt.hash(password, 10);
      const val = await user.update({
        where: {
          username,
        },
        data: {
          password: n_pass,
        },
      });
      if (!val) return { id: -1, error: 'An Error Occured' };
      return { id: val.id, user: val.username };
    } catch (error) {
      return {
        id: -1,
        error: error.message,
      };
    }
  }

  async change_photo(params) {
    const { filename, username } = params;

    try {
      const val = await user.update({
        where: {
          username,
        },
        data: {
          avatar: 'http://0.0.0.0:5000/uploads/' + filename, /// FIX
        },
      });
      if (!val)
        return {
          id: -1,
          error: 'error',
        };
      return {
        id: val.id,
        user: val.username,
        avatar: val.avatar,
      };
    } catch (error) {
      return {
        id: -1,
        error: error.messgae,
      };
    }
  }
  async change_username(b) {
    const { username, displayname } = b.data;
    const u = await user.findUnique({
      where: {
        username: displayname,
      },
    });
    if (u)
      return {
        id: -1,
        error: 'User Exist',
      };
    try {
      const res = await user.update({
        where: {
          username: username,
        },
        data: {
          username: displayname,
        },
      });
      if (!res)
        return {
          id: -1,
          error: 'Update Fail',
        };
      else
        return {
          id: res.id,
        };
    } catch (error) {
      return {
        id: -1,
        error: 'Crash',
      };
    }
  }

  /*  Delete User */
  async delete_user(username, password) {
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
      const ret = await bcrypt.compare(password, u.password);
      if (!ret)
        return {
          id: -1,
        };
      const val = await user.delete({
        where: {
          username,
        },
      });
      if (!val)
        return {
          id: -1,
          error: 'error user',
        };
      return {
        id: val.id,
        username: val.username,
      };
    } catch (error) {
      return {
        id: -1,
        error: 'crash',
      };
    }
  }

  async block_user(b_user, username) {
    let bl = false;
    try {
      const u = await user.findUnique({
        where: {
          username: b_user,
        },
      });
      if (!u)
        return {
          id: -1,
        };
      const m = await user.findUnique({
        where: {
          username,
        },
      });
      if (!m)
        return {
          id: -1,
        };
      let b_users = m.blocked;
      if (b_users.indexOf(u.id) >= 0) b_users.splice(b_users.indexOf(u.id), 1);
      else {
        b_users.push(u.id);
        bl = true;
      }
      const ret = await user.update({
        where: {
          username,
        },
        data: {
          blocked: b_users,
        },
      });
      if (!ret)
        return {
          id: -1,
        };
      return {
        id: m.id,
        type: bl,
      };
    } catch (error) {
      return {
        id: -1,
      };
    }
  }

  async get_user_id(name) {
    try {
      const u = await user.findUnique({
        where: {
          username: name,
        },
      });
      if (!u) return -1;
      return u.id;
    } catch (error) {
      console.log(error.message);
      return -1;
    }
  }

  async get_user_username(id) {
    try {
      const u = await user.findUnique({
        where: {
          id: id,
        },
      });
      if (!id) return '';
      return u.username;
    } catch (error) {
      console.log(error.message);
      return '';
    }
  }

  async change_title(username, title) {
    try {
      const r = await user.findUnique({
        where: {
          username,
        },
        select: {
          rating: true,
        },
      });
      if (!r || r.rating - 50 < 0)
        return {
          id: -1,
        };
      let rat = r.rating - 50;
      if (rat < 0)
        return {
          id: -1,
        };
      const u = await user.update({
        where: {
          username,
        },
        data: {
          title: title,
          rating: rat,
        },
      });
      if (!u)
        return {
          id: -1,
        };
      return {
        id: u.id,
        xp: u.rating,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  remove_elem_array(array, value) {
    for (let index = 0; index < array.length; index++) {
      if (array[index] == value) {
        array.splice(index, 1);
        return array;
      }
    }
  }

  async change_status(status, username) {
    try {
      const u = await user.update({
        where: {
          username,
        },
        data: {
          status,
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
      console.log(error.mesasge);
      return {
        id: -1,
      };
    }
  }

  async change_title_game(userId, title) {
    try {
      if (!this.inputvalidation.titleValidation(title))
        return {
          id: -1,
        };
      const u = await user.update({
        where: {
          id: userId,
        },
        data: {
          title: title,
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

  async change_xp(userId, xp) {
    try {
      let xp_val = 0;
      let wins = 0;
      let losses = 0;
      let ladder_level = 0;
      const u = await user.findUnique({
        where: {
          id: userId,
        },
      });
      wins = u.num_wins;
      losses = u.num_loss;
      if (xp > 0) wins++;
      else losses++;
      xp_val = u.rating + xp;
      if (xp_val < 0) xp_val = 0;
      if (xp_val >= 200) ladder_level = 1;
      if (xp_val >= 300) ladder_level = 2;
      if (xp_val >= 500) ladder_level = 3;
      if (xp_val >= 700) ladder_level = 4;
      if (xp_val >= 1000) ladder_level = 5;
      const u_u = await user.update({
        where: {
          id: userId,
        },
        data: {
          rating: xp_val,
          num_loss: losses,
          num_wins: wins,
          ladder_level,
        },
      });
      if (!u_u)
        return {
          id: -1,
        };
      return {
        id: u_u.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async get_user_info(b) {
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
      return {
        id: u.id,
        u,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async add_win(p) {
    try {
      let num_wins = 0;
      const d_u = await user.findUnique({
        where: {
          id: p,
        },
      });
      if (!d_u)
        return {
          id: -1,
        };
      num_wins = d_u.num_wins + 1;
      const u = await user.update({
        where: {
          id: p,
        },
        data: {
          num_wins: num_wins,
        },
      });
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async add_loss(p) {
    try {
      let num_losses = 0;
      const d_u = await user.findUnique({
        where: {
          id: p,
        },
      });
      if (!d_u)
        return {
          id: -1,
        };
      num_losses = d_u.num_loss + 1;
      const u = await user.update({
        where: {
          id: p,
        },
        data: {
          num_loss: num_losses,
        },
      });
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async add_gameId(username, gameId) {
    try {
      const u = await user.update({
        where: {
          username: username,
        },
        data: {
          inGame: gameId,
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
}
