import { MatchmakingQueueService } from '../matchmaking/services/matchmaking-queue.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MatchEntity } from './entities/match.entity';
import { MatchStatus } from './entities/match-status.enum';
import { MatchRoundsService } from './services/match-rounds.service';
import { MatchesService } from './matches.service';

describe('MatchesService', () => {
  let service: MatchesService;
  let matchesRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let matchmakingQueueService: jest.Mocked<
    Pick<MatchmakingQueueService, 'releaseEntriesForMatch'>
  >;
  let matchRoundsService: jest.Mocked<
    Pick<MatchRoundsService, 'createInitialRound' | 'ensureCurrentRound'>
  >;
  let realtimeGateway: jest.Mocked<Pick<RealtimeGateway, 'emitToMatch'>>;

  beforeEach(() => {
    matchesRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    matchmakingQueueService = {
      releaseEntriesForMatch: jest.fn(),
    };
    matchRoundsService = {
      createInitialRound: jest.fn(),
      ensureCurrentRound: jest.fn(),
    };
    realtimeGateway = {
      emitToMatch: jest.fn(),
    };

    service = new MatchesService(
      matchesRepository as never,
      {
        find: jest.fn(),
      } as never,
      matchmakingQueueService as unknown as MatchmakingQueueService,
      matchRoundsService as unknown as MatchRoundsService,
      realtimeGateway as unknown as RealtimeGateway,
    );
  });

  it('ends a match and releases both players', async () => {
    const match = {
      id: 'match-1',
      matchStatus: MatchStatus.Lobby,
      player1UserId: 'user-1',
      player2UserId: 'user-2',
    } as MatchEntity;

    matchesRepository.findOne.mockResolvedValue(match);
    matchesRepository.save.mockResolvedValue(match);
    matchmakingQueueService.releaseEntriesForMatch.mockReturnValue([
      'user-1',
      'user-2',
    ]);

    const response = await service.endMatchForTesting('match-1', 'user-1');

    expect(matchesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        endedAt: expect.any(Date),
        matchStatus: MatchStatus.Cancelled,
      }),
    );
    expect(matchmakingQueueService.releaseEntriesForMatch).toHaveBeenCalledWith(
      'match-1',
    );
    expect(realtimeGateway.emitToMatch).toHaveBeenCalledWith(
      'match-1',
      'match_ended',
      {
        match_id: 'match-1',
        match_status: MatchStatus.Cancelled,
        released_players: 2,
      },
    );
    expect(response).toEqual({
      match_id: 'match-1',
      match_status: MatchStatus.Cancelled,
      message: 'Match ended for testing',
      released_players: 2,
    });
  });
});
