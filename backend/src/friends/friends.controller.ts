import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import FriendsService from "./friends.service";

@Controller()
export default class FriendsController{
    constructor(private readonly friendsservice : FriendsService){}

    @Get('/:user/friends')
    get_friends(@Param('user') username)
    {
        return this.friendsservice.get_friends(username);
    }

    @Post('/friend_request')
    create_friend_request(@Body() b)
    {
        const { username, friend} = b.data;
        return this.friendsservice.create_friend_request(username, friend);
    }

    @Get('/:user/friendsrequest')
    get_friends_request(@Param('user') username)
    {
        return this.friendsservice.get_friends_request(username)
    }

    @Delete("/delete_friends_request")
    delete_friends_request(@Body() b)
    {
        return this.friendsservice.delete_friends_request(b.id)
    }
    
    @Post('/accept_friend')
    accept_friend(@Body() b)
    {
        return this.friendsservice.accept_friend(b.data.id)
    }
}