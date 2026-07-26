import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Optional display name for guest sessions. When omitted, a Guest_XXXX name is generated. */
export class GuestDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  @MaxLength(40)
  @MinLength(4)
  @IsString()
  @IsOptional()
  display_name?: string;
}
