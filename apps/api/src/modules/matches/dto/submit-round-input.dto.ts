import { Transform } from 'class-transformer';
import { IsDefined, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SubmitRoundInputDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(100)
  @MinLength(1)
  @IsString()
  @IsDefined({ message: 'input is required' })
  input!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @MaxLength(100)
  @IsOptional()
  @IsString()
  normalized_input?: string;
}
