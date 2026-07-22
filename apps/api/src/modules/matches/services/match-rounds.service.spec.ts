import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { MatchEntity } from '../entities/match.entity';
import { MatchStatus } from '../entities/match-status.enum';
import { RoundStatus } from '../entities/round-status.enum';
import { MatchCatalogService } from './match-catalog.service';
import { DuelResultsService } from './duel-results.service';
import { MatchRoundsService } from './match-rounds.service';

describe('MatchRoundsService', () => {
  let service: MatchRoundsService;
  let itemsRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };
  let matchesRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let roundsRepository: {
    create: jest.Mock;
    findOne: jest.Mock;
    findOneByOrFail: jest.Mock;
    save: jest.Mock;
  };
  let roundSubmissionsRepository: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let realtimeGateway: jest.Mocked<
    Pick<RealtimeGateway, 'emitToMatch' | 'emitToUser'>
  >;
  let duelResultsService: jest.Mocked<Pick<DuelResultsService, 'resolve'>>;

  beforeEach(() => {
    itemsRepository = {
      create: jest.fn((value) => value),
      findOne: jest.fn(),
      save: jest.fn(async (value) => ({
        id: value.id ?? 'item-1',
        ...value,
      })),
    };
    matchesRepository = {
      findOne: jest.fn(),
      save: jest.fn(async (value) => value),
    };
    roundsRepository = {
      create: jest.fn((value) => value),
      findOne: jest.fn(),
      findOneByOrFail: jest.fn(),
      save: jest.fn(async (value) => ({
        id: value.id ?? 'round-1',
        ...value,
      })),
    };
    roundSubmissionsRepository = {
      create: jest.fn((value) => value),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(async (value) => ({
        id: value.id ?? 'submission-1',
        ...value,
      })),
    };
    realtimeGateway = {
      emitToMatch: jest.fn(),
      emitToUser: jest.fn(),
    };
    duelResultsService = {
      resolve: jest.fn(),
    };

    service = new MatchRoundsService(
      itemsRepository as never,
      matchesRepository as never,
      roundsRepository as never,
      roundSubmissionsRepository as never,
      new MatchCatalogService(),
      duelResultsService as unknown as DuelResultsService,
      realtimeGateway as unknown as RealtimeGateway,
    );
  });

  it('validates a known household item', async () => {
    matchesRepository.findOne.mockResolvedValue({
      id: 'match-1',
      matchStatus: MatchStatus.Lobby,
      player1UserId: 'user-1',
      player2UserId: 'user-2',
      themeName: null,
      levelMax: null,
      levelMin: null,
    } as MatchEntity);
    roundsRepository.findOne.mockResolvedValue({
      id: 'round-1',
      matchId: 'match-1',
      roundStatus: RoundStatus.Open,
    });

    const result = await service.validateInput(
      'match-1',
      'round-1',
      { id: 'user-1' } as never,
      'chair',
    );

    expect(result).toEqual({
      invalid_reason: null,
      is_valid: true,
      level_match: null,
      normalized_input: 'chair',
      power_level: null,
      theme_match: null,
    });
  });

  it('accepts open-ended gibberish input on submit', async () => {
    matchesRepository.findOne.mockResolvedValue({
      id: 'match-1',
      matchStatus: MatchStatus.Lobby,
      player1UserId: 'user-1',
      player2UserId: 'user-2',
      themeName: null,
      levelMax: null,
      levelMin: null,
    } as MatchEntity);
    roundsRepository.findOne.mockResolvedValue({
      id: 'round-1',
      matchId: 'match-1',
      roundStatus: RoundStatus.Open,
    });
    roundSubmissionsRepository.findOne.mockResolvedValue(null);
    roundSubmissionsRepository.find.mockResolvedValue([
      {
        id: 'submission-1',
        item: {
          id: 'item-1',
          powerLevel: null,
        },
        itemId: 'item-1',
        normalizedInput: 'blorptastic',
        userId: 'user-1',
      },
    ]);
    roundsRepository.findOneByOrFail.mockResolvedValue({
      id: 'round-1',
      roundStatus: RoundStatus.Open,
    });

    const response = await service.submitInput(
      'match-1',
      'round-1',
      { id: 'user-1' } as never,
      'blorptastic',
    );

    expect(response).toEqual({
      icon_status: 'pending',
      icon_url: null,
      item_id: 'item-1',
      round_status: RoundStatus.Open,
      submission_id: 'submission-1',
    });
  });
});
