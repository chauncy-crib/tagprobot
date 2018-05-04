import test from 'tape';
import sinon from 'sinon';

import { ROLES } from '../constants';
import { initMe } from '../gameState';
import {
  cleanTeammateRoles,
  isMyTurnToAssumeRole,
  assumeComplementaryRole,
  __RewireAPI__ as PlayerRolesRewireAPI,
} from '../playerRoles';


test('cleanTeammateRoles()', tester => {
  tester.test('removes roles for players that are no longer in the game', t => {
    const mockPlayerId = 2;
    const mockTagproPlayers = { 2: { id: 2, name: 'Some Ball 2', team: 1 } };
    global.tagpro = { playerId: mockPlayerId, players: mockTagproPlayers };
    const mockPlayerRoles = { 1: ROLES.OFFENSE, 2: ROLES.DEFENSE };
    PlayerRolesRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);

    initMe();
    cleanTeammateRoles();
    t.same(mockPlayerRoles, { 2: 'DEFENSE' });

    global.tagpro = undefined;
    PlayerRolesRewireAPI.__ResetDependency__('playerRoles');
    t.end();
  });

  tester.test('assigns ROLES.NOT_DEFINED roles to teammates whose roles are not known', t => {
    const mockPlayerId = 1;
    const mockTagproPlayers = {
      1: { id: 1, name: 'Some Ball 1', team: 1 },
      2: { id: 2, name: 'Some Ball', team: 1 },
      3: { id: 3, name: '1730 asdf asdf gasd 3', team: 1 },
    };
    global.tagpro = { playerId: mockPlayerId, players: mockTagproPlayers };
    const mockPlayerRoles = { 1: ROLES.OFFENSE };
    PlayerRolesRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);

    initMe();
    cleanTeammateRoles();
    t.same(mockPlayerRoles, { 1: ROLES.OFFENSE, 2: ROLES.NOT_DEFINED, 3: ROLES.NOT_DEFINED });

    global.tagpro = undefined;
    PlayerRolesRewireAPI.__ResetDependency__('playerRoles');
    t.end();
  });
});


test('isMyTurnToAssumeRole()', tester => {
  tester.test('returns true when I am oldest teammate without defined role', t => {
    const mockCleanTeammateRoles = sinon.stub();
    PlayerRolesRewireAPI.__Rewire__('cleanTeammateRoles', mockCleanTeammateRoles);
    const mockTeammatesWithLowerIds = {
      1: { id: 1, name: 'Some Ball 1', team: 1 },
      2: { id: 2, name: 'Some Ball 2', team: 1 },
    };
    const mockGetTeammatesWithLowerIds = sinon.stub().returns(mockTeammatesWithLowerIds);
    PlayerRolesRewireAPI.__Rewire__('getTeammatesWithLowerIds', mockGetTeammatesWithLowerIds);
    const mockPlayerRoles = { 1: ROLES.OFFENSE, 2: ROLES.DEFENSE, 3: ROLES.NOT_DEFINED };
    PlayerRolesRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);

    t.is(isMyTurnToAssumeRole(), true);

    PlayerRolesRewireAPI.__ResetDependency__('cleanTeammateRoles');
    PlayerRolesRewireAPI.__ResetDependency__('getTeammatesWithLowerIds');
    PlayerRolesRewireAPI.__ResetDependency__('playerRoles');
    t.end();
  });

  tester.test('returns false when an older teammate has a not defined role', t => {
    const mockCleanTeammateRoles = sinon.stub();
    PlayerRolesRewireAPI.__Rewire__('cleanTeammateRoles', mockCleanTeammateRoles);
    const mockTeammatesWithLowerIds = {
      1: { id: 1, name: 'Some Ball 1', team: 1 },
      2: { id: 2, name: 'Some Ball 2', team: 1 },
    };
    const mockGetTeammatesWithLowerIds = sinon.stub().returns(mockTeammatesWithLowerIds);
    PlayerRolesRewireAPI.__Rewire__('getTeammatesWithLowerIds', mockGetTeammatesWithLowerIds);
    const mockPlayerRoles = { 1: ROLES.OFFENSE, 2: ROLES.NOT_DEFINED, 3: ROLES.NOT_DEFINED };
    PlayerRolesRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);

    t.is(isMyTurnToAssumeRole(), false);

    PlayerRolesRewireAPI.__ResetDependency__('cleanTeammateRoles');
    PlayerRolesRewireAPI.__ResetDependency__('getTeammatesWithLowerIds');
    PlayerRolesRewireAPI.__ResetDependency__('playerRoles');
    t.end();
  });
});


test('assumeComplementaryRole()', tester => {
  tester.test('assume offense if 0 offense and 0 defense', t => {
    const mockPlayerRoles = { 1: ROLES.NOT_DEFINED, 2: ROLES.NOT_DEFINED };
    PlayerRolesRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);
    const mockSetMyRole = sinon.spy();
    PlayerRolesRewireAPI.__Rewire__('setMyRole', mockSetMyRole);
    const mockGetMyRole = sinon.stub();
    PlayerRolesRewireAPI.__Rewire__('getMyRole', mockGetMyRole);

    assumeComplementaryRole();
    t.is(mockSetMyRole.firstCall.args[0], ROLES.OFFENSE);

    PlayerRolesRewireAPI.__ResetDependency__('playerRoles');
    PlayerRolesRewireAPI.__ResetDependency__('setMyRole');
    PlayerRolesRewireAPI.__ResetDependency__('getMyRole');
    t.end();
  });

  tester.test('assume defense if 1 offense and 0 defense', t => {
    const mockPlayerRoles = { 1: ROLES.OFFENSE, 2: ROLES.NOT_DEFINED };
    PlayerRolesRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);
    const mockSetMyRole = sinon.spy();
    PlayerRolesRewireAPI.__Rewire__('setMyRole', mockSetMyRole);
    const mockGetMyRole = sinon.stub();
    PlayerRolesRewireAPI.__Rewire__('getMyRole', mockGetMyRole);

    assumeComplementaryRole();
    t.is(mockSetMyRole.firstCall.args[0], ROLES.DEFENSE);

    PlayerRolesRewireAPI.__ResetDependency__('playerRoles');
    PlayerRolesRewireAPI.__ResetDependency__('setMyRole');
    PlayerRolesRewireAPI.__ResetDependency__('getMyRole');
    t.end();
  });
});
