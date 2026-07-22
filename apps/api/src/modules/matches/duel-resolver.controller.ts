import { Body, Controller, Post } from '@nestjs/common';

import { MockDuelResolveDto } from './dto/mock-duel-resolve.dto';
import { DuelResolverService } from './services/duel-resolver.service';

@Controller('duel-resolver')
export class DuelResolverController {
  constructor(private readonly duelResolverService: DuelResolverService) {}

  @Post('mock')
  resolveMockDuel(@Body() request: MockDuelResolveDto) {
    return this.duelResolverService.resolve({
      firstInput: request.first_input,
      secondInput: request.second_input,
    });
  }
}
