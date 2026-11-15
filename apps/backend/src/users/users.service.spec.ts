/// <reference types="jest" />
import { UsersService } from './users.service';

function setup() {
  const exec = jest.fn().mockResolvedValue([]);
  const sort = jest.fn().mockReturnValue({ exec });
  const find = jest.fn().mockReturnValue({ sort });
  return { service: new UsersService({ find } as any), find };
}

// Accounts created before the approval feature have no `role`/`status` fields in MongoDB.
// Mongo queries don't apply schema defaults, so `{ role: 'user' }` silently skips them.
describe('UsersService.listMembers (legacy accounts without role/status)', () => {
  it('lists everyone except super admins — including docs with no role field', async () => {
    const { service, find } = setup();
    await service.listMembers();
    expect(find).toHaveBeenCalledWith({ role: { $ne: 'superadmin' } });
  });

  it('"pending" filter also matches legacy docs with no status field', async () => {
    const { service, find } = setup();
    await service.listMembers('pending');
    expect(find).toHaveBeenCalledWith({
      role: { $ne: 'superadmin' },
      status: { $in: ['pending', null] },
    });
  });

  it('other status filters stay exact', async () => {
    const { service, find } = setup();
    await service.listMembers('approved');
    expect(find).toHaveBeenCalledWith({
      role: { $ne: 'superadmin' },
      status: 'approved',
    });
  });
});
