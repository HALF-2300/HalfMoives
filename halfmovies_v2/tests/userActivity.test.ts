import { logUserActivity } from '../server/src/analytics/userActivity';

describe('logUserActivity', () => {
  it('calls prisma.userActivity.create with payload', async () => {
    const create = jest.fn().mockResolvedValue({ id: '1' });
    const prisma: any = { userActivity: { create } };

    await logUserActivity(prisma, 'user-1', 'favorite:add', { movieId: 'm1' });

    expect(create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        action: 'favorite:add',
        metadata: { movieId: 'm1' }
      }
    });
  });
});
