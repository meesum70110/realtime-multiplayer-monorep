import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { UserEntity } from '../auth/entities/user.entity';
import { JoinQueueDto } from './dto/join-queue.dto';
import { MatchmakingService } from './matchmaking.service';

@Controller('matchmaking')
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}

  @Post('queue')
  joinQueue(
    @Body() request: JoinQueueDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.matchmakingService.joinQueue(user, request);
  }

  @Get('queue/:queueEntryId')
  getQueueStatus(
    @Param('queueEntryId', new ParseUUIDPipe()) queueEntryId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.matchmakingService.getQueueStatus(queueEntryId, user.id);
  }

  @Delete('queue/:queueEntryId')
  cancelQueue(
    @Param('queueEntryId', new ParseUUIDPipe()) queueEntryId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.matchmakingService.cancelQueue(queueEntryId, user.id);
  }
}
