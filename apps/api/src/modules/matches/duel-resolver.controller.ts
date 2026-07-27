import { Body, Controller, Post } from '@nestjs/common';

import { Public } from '../../common/auth/public.decorator';
import { MockDuelResolveDto } from './dto/mock-duel-resolve.dto';
import { DuelResolverService } from './services/duel-resolver.service';

@Controller('duel-resolver')
export class DuelResolverController {
  constructor(private readonly duelResolverService: DuelResolverService) {}

  /** Shared AI judge for online rounds and offline/bot clashes. */
  @Public()
  @Post('mock')
  async resolveMockDuel(@Body() request: MockDuelResolveDto) {
    return this.duelResolverService.resolve({
      firstInput: request.first_input,
      secondInput: request.second_input,
    });
  }
}
