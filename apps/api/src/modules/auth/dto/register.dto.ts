import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  @MaxLength(40)
  @MinLength(4)
  @IsString()
  @IsDefined({ message: 'display_name is required' })
  display_name!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @MaxLength(320)
  @IsEmail()
  @IsDefined({ message: 'email is required' })
  email!: string;

  @MaxLength(128)
  @MinLength(8)
  @Matches(/[A-Za-z]/, {
    message: 'password must include at least one letter',
  })
  @Matches(/[0-9]/, {
    message: 'password must include at least one number',
  })
  @IsString()
  @IsDefined({ message: 'password is required' })
  password!: string;
}
