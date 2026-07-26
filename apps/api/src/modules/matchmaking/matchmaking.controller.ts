import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { UserEntity } from '../auth/entities/user.entity';
import { JoinPrivateDto } from './dto/join-private.dto';
import { JoinQueueDto } from './dto/join-queue.dto';
import { MatchmakingService } from './matchmaking.service';

@Controller('matchmaking')
@UseInterceptors(NoFilesInterceptor())
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

  /** Create a private invite room and wait for a friend with the code. */
  @Post('private')
  createPrivate(@CurrentUser() user: UserEntity) {
    return this.matchmakingService.createPrivateLobby(user);
  }

  @Post('private/join')
  joinPrivate(
    @Body() request: JoinPrivateDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.matchmakingService.joinPrivateLobby(user, request.invite_code);
  }

  @Delete('private')
  cancelPrivate(@CurrentUser() user: UserEntity) {
    return this.matchmakingService.cancelPrivateLobby(user.id);
  }
}
