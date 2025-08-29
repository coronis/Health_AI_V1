import { HealthCoachUser } from './types';

describe('HealthCoachUser type', () => {
  it('should define a valid user type', () => {
    const user: HealthCoachUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };

    expect(user.id).toBe('1');
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });
});