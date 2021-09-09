import { MessageGateway } from './../gateway/message.gateway';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
const { user, messsage } = new PrismaClient();

@Injectable()
export default class MessageService {
  constructor(private readonly userservice: UsersService, public readonly messagegateway : MessageGateway) {}

  async get_unread(username, fr) {
    try {
      const val = await messsage.findMany({
        where: {
          sender: fr,
          receiver: username,
          seen: false,
        },
      });
      if (!val)
        return {
          id: -1,
        };
      return {
        id: 1,
        count: val.length,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async get_messages(b) {
    let msg = [];
    try {
      const m = await user.findUnique({
        where: {
          username: b.data.username,
        },
        select: {
          messages: true,
          id: true,
        },
      });
      const u_2 = await this.userservice.get_user_id(b.data.user_msg);
      if (!m || !u_2)
        return {
          id: -1,
        };
      let array = m.messages;
      for (let index = 0; index < array.length; index++) {
        const ms = await messsage.findUnique({
          where: {
            id: array[index],
          },
        });
        if (!ms) continue;
        if (ms.sender == u_2 || ms.receiver == u_2) msg.push(ms);
      }
      for (let index = 0; index < msg.length; index++) {
        if (msg[index].receiver == m.id) {
          const val = await messsage.update({
            where: {
              id: msg[index].id,
            },
            data: {
              seen: true,
            },
          });
        }
      }
      const y = await user.findUnique({
        where: {
          username: b.data.user_msg,
        },
      });
      return {
        id: 1,
        messages: msg,
        me: b.data.username,
        user: b.data.user_msg,
        myId: m.id,
        userAvatar: y.avatar,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }

  async send_message(b) {
    const message = b.data.message;
    try {
      const s = await this.userservice.get_user_id(b.data.sender);
      const r = await this.userservice.get_user_id(b.data.reciver);
      if (s < 0 || r < 0)
        return {
          id: -1,
        };
      const m = await messsage.create({
        data: {
          sender: s,
          receiver: r,
          message,
          seen: false,
        },
      });
      if (!m)
        return {
          id: -1,
        };
      const add_m1 = await user.findUnique({
        where: {
          id: s,
        },
        select: {
          messages: true,
        },
      });
      const add_m2 = await user.findUnique({
        where: {
          id: r,
        },
        select: {
          messages: true,
        },
      });
      const u1 = await user.update({
        where: {
          id: s,
        },
        data: {
          messages: {
            set: [...add_m1.messages, m.id],
          },
        },
      });
      const u2 = await user.update({
        where: {
          id: r,
        },
        data: {
          messages: {
            set: [...add_m2.messages, m.id],
          },
        },
      });

      await this.messagegateway.send_message(u2.username)
      return {
        id: m.id,
      };
    } catch (error) {
      console.log(error.message);
      return {
        id: -1,
      };
    }
  }
}
