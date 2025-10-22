import { Controller, Get } from '@nestjs/common';
import * as seed from '../data/init.seed.json';

@Controller('init')
export class InitController {
  @Get()
  getInit() {
    return seed;
  }
}
