import { Module } from '@nestjs/common';
import { InitController } from './init/init.controller';
import { InitService } from './init/init.service';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';

@Module({
  imports: [],
  controllers: [InitController, EventsController],
  providers: [InitService, EventsService],
})
export class AppModule {}
