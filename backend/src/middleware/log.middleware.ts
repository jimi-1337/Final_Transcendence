import { Injectable, NestMiddleware } from "@nestjs/common";
import {Request, Response} from 'express'


@Injectable()
export default class LogMiddleware implements NestMiddleware{
    use(req: Request, res: Response, next: () => void) {
        throw new Error("Method not implemented.");
    }

}