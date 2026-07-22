import { PasswordHasherService } from './password-hasher.service';

describe('PasswordHasherService', () => {
  let service: PasswordHasherService;

  beforeEach(() => {
    service = new PasswordHasherService();
  });

  it('hashes and verifies passwords', async () => {
    const passwordHash = await service.hashPassword('Password123');

    await expect(
      service.verifyPassword('Password123', passwordHash),
    ).resolves.toBe(true);
    await expect(
      service.verifyPassword('WrongPassword123', passwordHash),
    ).resolves.toBe(false);
  });
});
