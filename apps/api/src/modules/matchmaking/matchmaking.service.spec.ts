import { MatchEntity } from '../matches/entities/match.entity';
import { MatchStatus } from '../matches/entities/match-status.enum';
import { MatchModeType } from '../matches/entities/match-mode-type.enum';
import { MatchRuleType } from '../matches/entities/match-rule-type.enum';
import { MatchesService } from '../matches/matches.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { QueueStatus } from './enums/queue-status.enum';
import { MatchmakingService } from './matchmaking.service';
import { FifoMatchmakingStrategy } from './services/fifo-matchmaking.strategy';
import { MatchmakingModeService } from './services/matchmaking-mode.service';
import { MatchmakingQueueService } from './services/matchmaking-queue.service';
import { PrivateLobbyService } from './services/private-lobby.service';

describe('MatchmakingService', () => {
  let service: MatchmakingService;
  let matchesService: jest.Mocked<Pick<MatchesService, 'createLobbyMatch'>>;
  let realtimeGateway: jest.Mocked<
    Pick<RealtimeGateway, 'addUsersToMatchRoom' | 'emitToUser'>
  >;

  beforeEach(() => {
    matchesService = {
      createLobbyMatch: jest.fn(),
    };
    realtimeGateway = {
      addUsersToMatchRoom: jest.fn(),
      emitToUser: jest.fn(),
    };

    service = new MatchmakingService(
      new FifoMatchmakingStrategy(),
      new MatchmakingModeService(),
      new MatchmakingQueueService(),
      new PrivateLobbyService(),
      matchesService as unknown as MatchesService,
      realtimeGateway as unknown as RealtimeGateway,
    );
  });

  it('keeps the first player waiting in queue', async () => {
    const response = await service.joinQueue(
      {
        id: 'user-1',
      } as never,
      {},
    );

    expect(response.queue_status).toBe(QueueStatus.Waiting);
    expect(matchesService.createLobbyMatch).not.toHaveBeenCalled();
  });

  it('matches the second queued player using FIFO order', async () => {
    matchesService.createLobbyMatch.mockResolvedValue({
      id: 'match-1',
      matchStatus: MatchStatus.Lobby,
      modeType: MatchModeType.OneVsOne,
    } as MatchEntity);

    await service.joinQueue(
      {
        id: 'user-1',
      } as never,
      {},
    );
    const response = await service.joinQueue(
      {
        id: 'user-2',
      } as never,
      {},
    );

    expect(matchesService.createLobbyMatch).toHaveBeenCalledWith({
      modeSnapshot: expect.objectContaining({
        modeType: MatchModeType.OneVsOne,
        ruleType: MatchRuleType.Open,
      }),
      player1UserId: 'user-1',
      player2UserId: 'user-2',
    });
    expect(response.queue_status).toBe(QueueStatus.Matched);
    expect(response.match_id).toBe('match-1');
    expect(realtimeGateway.emitToUser).toHaveBeenCalledWith(
      'user-1',
      'match_found',
      expect.objectContaining({
        match_id: 'match-1',
        player_side: 'player_1',
      }),
    );
    expect(realtimeGateway.emitToUser).toHaveBeenCalledWith(
      'user-2',
      'match_found',
      expect.objectContaining({
        match_id: 'match-1',
        player_side: 'player_2',
      }),
    );
  });
});
