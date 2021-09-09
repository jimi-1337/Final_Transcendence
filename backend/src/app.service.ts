import { Injectable } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';

const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');

const { user } = new PrismaClient();

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
