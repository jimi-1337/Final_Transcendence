import { MessageGateway } from './gateway/message.gateway';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import UsersController from './users/users.controllers';
import { UsersService } from './users/users.service';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import { join } from 'path';
import SearchController from './search/search.controller';
import SearchService from './search/search.service';
import ChannelController from './channel/channel.controller';
import ChannelService from './channel/channel.service';
import MatchController from './match/match.controller';
import MatchService from './match/match.service';
import FriendsController from './friends/friends.controller';
import FriendsService from './friends/friends.service';
import MessageController from './message/message.controllers';
import MessageService from './message/message.service';
import AdminController from './admin/admin.controller';
import AdminService from './admin/admin.service';
import GameController from './game/game.controller';
import GameService from './game/game.service';
import inputValidation from './inputValidation/inputValidation.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    SearchController,
    ChannelController,
    MatchController,
    FriendsController,
    MessageController,
    AdminController,
    GameController,
  ],
  providers: [
    AppService,
    AuthService,
    UsersService,
    SearchService,
    ChannelService,
    MatchService,
    FriendsService,
    MessageService,
    MessageGateway,
    AdminService,
    GameService,
    inputValidation,
  ],
})
export class AppModule {}
