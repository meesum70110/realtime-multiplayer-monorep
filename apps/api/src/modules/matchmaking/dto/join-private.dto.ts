import { Transform } from 'class-transformer';
import { IsDefined, IsString, Length, Matches } from 'class-validator';

export class JoinPrivateDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @Matches(/^[A-F0-9]{6}$/i, {
    message: 'invite_code must be a 6-character room code',
  })
  @Length(6, 6)
  @IsString()
  @IsDefined({ message: 'invite_code is required' })
  invite_code!: string;
}
