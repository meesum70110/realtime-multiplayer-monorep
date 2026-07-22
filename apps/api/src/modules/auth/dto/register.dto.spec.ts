import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('accepts a valid register payload', async () => {
    const dto = plainToInstance(RegisterDto, {
      display_name: 'Safwan',
      email: 'safwan@gmail.com',
      password: 'safwan01',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects short display names', async () => {
    const dto = plainToInstance(RegisterDto, {
      display_name: 'Abc',
      email: 'safwan@gmail.com',
      password: 'safwan01',
    });

    const errors = await validate(dto, {
      stopAtFirstError: true,
    });

    expect(errors[0]?.constraints).toEqual({
      minLength: 'display_name must be longer than or equal to 4 characters',
    });
  });
});
