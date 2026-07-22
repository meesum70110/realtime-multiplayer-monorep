import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchCatalogService {
  getSuggestions(limit = 5): string[] {
    if (limit <= 0) {
      return [];
    }

    return [];
  }
}
