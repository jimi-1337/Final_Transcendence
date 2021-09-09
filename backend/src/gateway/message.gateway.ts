import { Socket } from 'socket.io';
import { Logger, Param } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayDisconnect,
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'http';
import { UsersService } from 'src/users/users.service';
import GameService from 'src/game/game.service';
let connectd_users = [];
let live_games = [];
// let req_live;

@WebSocketGateway()
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly userservice: UsersService,
    private readonly gameservice: GameService,
  ) {}
  @WebSocketServer() server: Server;

  @SubscribeMessage('init_user')
  async init_user(client: Socket, payload: any) {
    connectd_users.push({ name: payload.data.username, socket: client });
    await this.userservice.change_status('online', payload.data.username);
  }

  @SubscribeMessage('leave game')
  async leave_game(client: Socket, payload: any) {
    client.leave(payload.data.gameId);
    for (let index = 0; index < connectd_users.length; index++) {
      if (connectd_users[index].name == payload.data.username) {
        for (let index = 0; index < live_games.length; index++) {
          if (live_games[index].gameId == payload.data.gameId) {
            if (live_games[index].player1.name == payload.data.username)
              live_games[index].p1 = 0;
            if (live_games[index].player2.name == payload.data.username)
              live_games[index].p2 = 0;
            if (live_games[index].p2 == 0 && live_games[index].p1 == 0)
              await this.GameOver(index);
          }
        }
        return this.userservice.change_status('online', payload.data.username);
      }
    }
    this.userservice.change_status('offline', payload.data.username);
  }

  @SubscribeMessage('in game')
  async add_to_game(client: Socket, payload: any) {
    if (!client.rooms[payload.data.gameId]) {
      client.join(payload.data.gameId);
      for (let index = 0; index < live_games.length; index++) {
        if (live_games[index].gameId == payload.data.gameId) {
          if (live_games[index].player1.name == payload.data.username)
            live_games[index].p1 = 1;
          if (live_games[index].player2.name == payload.data.username)
            live_games[index].p2 = 1;
        }
      }
      await this.userservice.change_status('in_game', payload.data.username);
      await this.userservice.add_gameId(
        payload.data.username,
        payload.data.gameId,
      );
    }
  }

  @SubscribeMessage('update_game')
  update_game(client: Socket, payload: any) {
    for (let index = 0; index < connectd_users.length; index++) {
      if (
        connectd_users[index].socket.rooms[payload.data.gameId] &&
        payload.data.username != connectd_users[index].name
      ) {
        connectd_users[index].socket.emit('update_game', {
          data: payload.data,
        });
      }
    }
  }

  @SubscribeMessage('update_ball')
  update_ball(client: Socket, payload: any) {
    for (let index = 0; index < connectd_users.length; index++) {
      if (connectd_users[index].socket.rooms[payload.data.gameId]) {
        connectd_users[index].socket.emit('update_ball_pos', {
          data: payload.data,
        });
      }
    }
  }

  @SubscribeMessage('rest_game')
  async rest_game(client: Socket, payload: any) {
    let ret = payload;
    for (let index = 0; index < live_games.length; index++) {
      if (live_games[index].gameId == payload.data.gameId) {
        if (live_games[index].player1.score > payload.data.players[0]._score)
          ret.data.players[0]._score = live_games[index].player1.score;
        else live_games[index].player1.score = payload.data.players[0]._score;

        if (live_games[index].player2.score > payload.data.players[1]._score)
          ret.data.players[1]._score = live_games[index].player2.score;
        else live_games[index].player2.score = payload.data.players[1]._score;

        if (live_games[index].gamesnum > payload.data.gamesnum)
          ret.data.gamesnum = live_games[index].gamesnum;
        else live_games[index].gamesnum = payload.data.gamesnum;

        if (
          ret.data.players[0]._score + ret.data.players[1]._score >
          ret.data.gamesnum
        )
          ret.data.gamesnum =
            ret.data.players[0]._score + ret.data.players[1]._score;
        if (ret.data.gamesnum >= live_games[index].rounds) {
          await this.GameOver(index);
        }
      }
    }
    for (let index = 0; index < connectd_users.length; index++) {
      if (connectd_users[index].socket.rooms[payload.data.gameId]) {
        connectd_users[index].socket.emit('rest_game_vals', {
          data: ret.data,
        });
      }
    }
  }

  @SubscribeMessage('joinRoom')
  public joinRoom(client: Socket, room: string): void {
    if (!client.rooms[room]) client.join(room);
  }

  @SubscribeMessage('leaveRoom')
  public leaveRoom(client: Socket, room: string): void {
    client.leave(room);
  }

  send_message(user) {
    for (let index = 0; index < connectd_users.length; index++) {
      if (connectd_users[index].name == user)
        connectd_users[index].socket.emit('recived', 'value');
    }
  }

  send_to_room(room, username) {
    for (let index = 0; index < connectd_users.length; index++) {
      if (
        connectd_users[index].socket.rooms[room] &&
        connectd_users[index].name != username
      ) {
        connectd_users[index].socket.emit('recived_channel', room);
      }
    }
  }
  public afterInit(server: Server): void {}

  public handleDisconnect(client: Socket): void {
    let val = '';
    let count = 0;
    let n_u = connectd_users;
    for (let i = 0; i < connectd_users.length; i++) {
      if (connectd_users[i].socket == client) {
        val = connectd_users[i].name;
        n_u.splice(i, 1);
        if (n_u.length <= 0) {
          this.userservice.change_status('offline', val);
          connectd_users = n_u;
          return;
        }
        for (let index = 0; index < n_u.length; index++) {
          if (n_u[index].name == val) {
            count++;
            break;
          }
        }
        break;
      }
    }
    if (count == 0) {
      this.userservice.change_status('offline', val);
    }
    connectd_users = n_u;
  }

  public handleConnection(client: Socket): void {
    // return this.logger.log(`Client connected: ${client.id}`);
  }

  /// Handle Game Reqs
  @SubscribeMessage('challenge')
  challenge(client: Socket, payload: any) {
    for (let index = 0; index < connectd_users.length; index++) {
      if (connectd_users[index].name == payload.data.player2) {
        connectd_users[index].socket.emit('challenge', {
          data: payload.data,
        });
      }
    }
  }

  @SubscribeMessage('accept_game')
  accept_game(client: Socket, payload: any) {
    for (let index = 0; index < connectd_users.length; index++) {
      if (connectd_users[index].name == payload.data.player1) {
        connectd_users[index].socket.emit('accept_game', {
          data: payload.data,
        });
      }
    }
    live_games.push({
      gameId: payload.data.gameId,
      player1: {
        name: payload.data.player1,
        score: 0,
        size: 0,
        power: 1.1,
      },
      player2: {
        name: payload.data.player2,
        score: 0,
        size: 0,
        power: 1.1,
      },
      rounds: payload.data.rounds,
      p1: 0,
      p2: 0,
      ingame: false,
    });
  }
  @SubscribeMessage('get_game')
  update_click(client: Socket, payload: any) {
    // req_live = client;
    for (let index = 0; index < connectd_users.length; index++) {
      if (
        connectd_users[index].socket.rooms[payload.data.gameId] &&
        connectd_users[index].socket != client
      ) {
        connectd_users[index].socket.emit('live_feed', {
          data: payload.data,
        });
        return;
      }
    }
  }

  @SubscribeMessage('game_feed')
  feed_game(client: Socket, payload: any) {
    for (let index = 0; index < connectd_users.length; index++) {
      if (
        connectd_users[index].socket.rooms[payload.data.gameId] &&
        connectd_users[index].socket != client
      ) {
        connectd_users[index].socket.emit('live_game', {
          data: payload.data,
        });
      }
    }
  }

  @SubscribeMessage('decline_game')
  decline_game(client: Socket, payload: any) {
    for (let index = 0; index < connectd_users.length; index++) {
      if (connectd_users[index].name == payload.data.player1) {
        connectd_users[index].socket.emit('declined_game', {
          data: payload.data,
        });
      }
    }
  }

  GameOver(game) {
    const g = live_games[game];
    live_games.splice(game, 1);
    return this.gameservice.game_end(g);
  }

  @SubscribeMessage('change_game_power_ups')
  game_powerups(client: Socket, payload: any) {
    let ret = payload;
    for (let index = 0; index < live_games.length; index++) {
      if (payload.data.gameId == live_games[index].gameId) {
        if (payload.data.user == live_games[index].player1.name) {
          if (payload.data.val == 's+') live_games[index].player1.size += 1;
          else if (payload.data.val == 'p+')
            live_games[index].player1.power += 0.1;
          else if (payload.data.val == 's-')
            live_games[index].player2.size -= 1;
        } else if (payload.data.user == live_games[index].player2.name) {
          if (payload.data.val === 's+') live_games[index].player2.size += 1;
          else if (payload.data.val == 'p+')
            live_games[index].player2.power += 0.1;
          else if (payload.data.val == 's-')
            live_games[index].player1.size -= 1;
        }
        ret = live_games[index];
      }
    }
    for (let index = 0; index < connectd_users.length; index++) {
      if (connectd_users[index].socket.rooms[payload.data.gameId]) {
        connectd_users[index].socket.emit('update_powers', {
          data: ret,
        });
      }
    }
  }

  /* Live Game Fix*/
  @SubscribeMessage('PlayerPos')
  PlayerPos(client: Socket, payload: any) {
    for (let index = 0; index < connectd_users.length; index++) {
      if (
        connectd_users[index].socket.rooms[payload.data.gameId] &&
        connectd_users[index].socket != client
      )
        connectd_users[index].socket.emit('PlayersPos', { data: payload.data });
    }
  }

  @SubscribeMessage('StartGame')
  StartGame(client: Socket, payload: any) {
    for (let index = 0; index < live_games.length; index++) {
      if (live_games[index].gameId == payload.data.gameId) {
        live_games[index].ingame = true;
        break;
      }
    }
    for (let index = 0; index < connectd_users.length; index++) {
      if (
        connectd_users[index].socket.rooms[payload.data.gameId] &&
        connectd_users[index].socket != client
      )
        connectd_users[index].socket.emit('StartsGame', { data: payload.data });
    }
  }

  @SubscribeMessage('PlayerScored')
  async PlayerScored(client: Socket, payload: any) {
    let ret = payload;

    for (let index = 0; index < live_games.length; index++) {
      if (live_games[index].gameId == payload.data.gameId) {
        if (live_games[index].player1.score > payload.data.p1S)
          ret.data.p1S = live_games[index].player1.score;
        else live_games[index].player1.score = ret.data.p1S;

        if (live_games[index].player2.score > payload.data.p2S)
          ret.data.p2S = live_games[index].player2.score;
        else live_games[index].player2.score = ret.data.p2S;
        if (ret.data.p2S + ret.data.p1S >= live_games[index].rounds) {
          await this.GameOver(index);
        }
        break;
      }
    }
    for (let index = 0; index < connectd_users.length; index++) {
      if (
        connectd_users[index].socket.rooms[payload.data.gameId]
      )
      {
        connectd_users[index].socket.emit('PlayersScored', { data: ret.data });
      }
    }
  }

  @SubscribeMessage('GetCurrentGame')
  async GetCurrentGame(client: Socket, payload: any) {
    let ret = payload;

    for (let index = 0; index < connectd_users.length; index++) {
      if (
        connectd_users[index].socket.rooms[payload.data.gameId] &&
        connectd_users[index].socket != client
      )
        connectd_users[index].socket.emit('WantCurrentGame', {
          data: ret.data,
        });
      return;
    }
  }

  @SubscribeMessage('CurrentGameState')
  async CurrentGameState(client: Socket, payload: any) {
    const ret = payload;

    for (let index = 0; index < live_games.length; index++) {
      if (live_games[index].gameId == payload.data.gameId) {
        if (live_games[index].player1.score > payload.data.p1S)
          ret.data.p1S = live_games[index].player1.score;
        else live_games[index].player1.score = ret.data.p1S;

        if (live_games[index].player2.score > payload.data.p2S)
          ret.data.p2S = live_games[index].player2.score;
        else live_games[index].player2.score = ret.data.p2S;
        break ;
      }
    }
    for (let index = 0; index < connectd_users.length; index++) {
      if (
        connectd_users[index].socket.rooms[payload.data.gameId] /*&&
        connectd_users[index].socket != client */
      )
        connectd_users[index].socket.emit('FullCurrentGame', {
          data: ret.data,
        });
    }
  }
}
