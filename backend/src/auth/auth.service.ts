import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { PrismaClient } from '.prisma/client';
const { user } = new PrismaClient();
const bcrypt = require('bcryptjs');
var crypto = require('crypto');
// const mandrill = require('node-mandrill')(process.env.MANDRILL);
var nodemailer = require('nodemailer');

@Injectable()
export class AuthService {
  constructor(private readonly usersservice: UsersService) {}

  /* Intra Code For The User */
  get_intra_link() {
    return process.env.AUTH_LINK;
  }

  /* New Or Old User */
  async verify_user(b) {
    const intra_code = b.data.intra_code;
    try {
      const val = await axios({
        method: 'post',
        url: 'https://api.intra.42.fr/oauth/token',
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.INTRA_UID,
          client_secret: process.env.INTRA_SECRET,
          redirect_uri: process.env.REDIRECT_URI,
          code: intra_code,
        },
      });
      var { access_token, error } = val.data;
      if (error) return { id: -1, error: error.error_description };
      const newval = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: 'Bearer ' + access_token,
        },
      });
      const newerror = newval.data.error;
      const errormessage = newval.data.message;
      if (!newerror) return this.usersservice.create_user(newval.data);
      else return { id: 1, error: errormessage };
    } catch (error) {
      console.log(error.message)
      return { id: -1, error: error };
    }
  }

  async auth_user(b) {
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
      const h_pass = bcrypt.compare(u.password, b.password);
      if (!h_pass)
        return {
          id: -1,
          message: 'password',
        };
      const up = await user.update({
        where: {
          username: b.username,
        },
        data: {
          factory_auth: true,
          factory_email: b.email,
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

  async auth_val_user(b) {
    try {
      const u = await user.findUnique({
        where: {
          username: b.username,
        },
      });
      if (u.auth_code == b.code) {
        const up = await user.update({
          where: {
            username: b.username,
          },
          data: {
            auth_code: null,
          },
        });
        if (!up)
          return {
            id: -1,
          };
        return {
          id: u.id,
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

  async send_auth(b) {
    try {
      const u = await user.findUnique({
        where: {
          username: b.username,
        },
      });
      if (u.auth_code)
        return {
          id: u.id,
        };
      if (!u.factory_auth)
        return {
          id: -1,
        };
      var id = crypto.randomBytes(20).toString('hex');
      if (!id)
        return {
          id: -1,
        };
      var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.MAIL,
          pass: process.env.MAIL_PASS,
        },
      });

      var mailOptions = {
        from: process.env.MAIL,
        to: u.factory_email,
        subject: 'Transcendence  Authentication Code',
        text: `Your Authentication Code Is: ${id}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          {
            console.log(error);
            return {
              id: -1,
            };
          }
        }
      });
      const up = await user.update({
        where: {
          username: b.username,
        },
        data: {
          auth_code: id,
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

  async valid_auth(b) {
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
        auth: u.factory_auth,
        email: u.factory_email,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async deactivate_auth(b) {
    try {
      const u = await user.update({
        where: {
          username: b.username,
        },
        data: {
          factory_auth: false,
          factory_email: null,
          auth_code: null,
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
