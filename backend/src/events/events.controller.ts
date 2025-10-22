import { Body, Controller, Post } from '@nestjs/common';

@Controller('event')
export class EventsController {
  @Post()
  append(@Body() dto: any) {
    // For now, just log:
    console.log('EVENT', dto);
    return { ok: true };
  }
}
