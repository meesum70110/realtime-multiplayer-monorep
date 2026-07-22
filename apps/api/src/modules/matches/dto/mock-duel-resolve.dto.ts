import { Transform } from 'class-transformer';
import { IsDefined, IsString, MaxLength, MinLength } from 'class-validator';

export class MockDuelResolveDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(100)
  @MinLength(1)
  @IsString()
  @IsDefined({ message: 'first_input is required' })
  first_input!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(100)
  @MinLength(1)
  @IsString()
  @IsDefined({ message: 'second_input is required' })
  second_input!: string;
}
