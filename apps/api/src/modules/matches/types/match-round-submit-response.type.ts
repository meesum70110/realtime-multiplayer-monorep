import { ItemIconStatus } from '../entities/item-icon-status.enum';
import { RoundStatus } from '../entities/round-status.enum';

export type MatchRoundSubmitResponse = {
  icon_status: ItemIconStatus;
  icon_url: string | null;
  item_id: string;
  round_status: RoundStatus;
  submission_id: string;
};
