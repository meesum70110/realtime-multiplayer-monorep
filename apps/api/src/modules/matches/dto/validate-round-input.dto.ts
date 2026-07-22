import { Transform } from 'class-transformer';
import { IsDefined, IsString, MaxLength, MinLength } from 'class-validator';

export class ValidateRoundInputDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(100)
  @MinLength(1)
  @IsString()
  @IsDefined({ message: 'input is required' })
  input!: string;
}
