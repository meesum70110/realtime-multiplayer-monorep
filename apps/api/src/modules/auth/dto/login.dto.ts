import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @MaxLength(320)
  @IsEmail()
  @IsDefined({ message: 'email is required' })
  email!: string;

  @MaxLength(128)
  @MinLength(8)
  @IsString()
  @IsDefined({ message: 'password is required' })
  password!: string;
}
