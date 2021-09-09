import { Body, Controller, Post } from "@nestjs/common";
import MessageService from "./message.service";

@Controller()
export default class MessageController
{
    constructor(private readonly messageservice : MessageService){};

    @Post("/messages")
    get_messages(@Body() b)
    {
        return this.messageservice.get_messages(b);
    }

    @Post("/send_message")
    send_message(@Body() b)
    {
        return this.messageservice.send_message(b);
    }
}