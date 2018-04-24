import test from 'tape';
import sinon from 'sinon';

import { ROLES } from '../constants';
import {
  initMe,
  cleanTeammateRoles,
  isMyTurnToAssumeRole,
  __RewireAPI__ as GameStateRewireAPI,
} from '../gameState';


test('cleanTeammateRoles()', tester => {
  tester.test('removes roles for players that are no longer in the game', t => {
    const mockPlayerId = 2;
    const mockTagproPlayers = { 2: { id: 2, name: 'Some Ball 2', team: 1 } };
    global.tagpro = { playerId: mockPlayerId, players: mockTagproPlayers };
    const mockPlayerRoles = { 1: ROLES.OFFENSE, 2: ROLES.DEFENSE };
    GameStateRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);

    initMe();
    cleanTeammateRoles();
    t.same(mockPlayerRoles, { 2: 'DEFENSE' });

    global.tagpro = undefined;
    GameStateRewireAPI.__ResetDependency__('playerRoles');
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
    GameStateRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);

    initMe();
    cleanTeammateRoles();
    t.same(mockPlayerRoles, { 1: ROLES.OFFENSE, 2: ROLES.NOT_DEFINED, 3: ROLES.NOT_DEFINED });

    global.tagpro = undefined;
    GameStateRewireAPI.__ResetDependency__('playerRoles');
    t.end();
  });
});


test('isMyTurnToAssumeRole()', tester => {
  tester.test('returns true when I am oldest teammate without defined role', t => {
    const mockCleanTeammateRoles = sinon.stub();
    GameStateRewireAPI.__Rewire__('cleanTeammateRoles', mockCleanTeammateRoles);
    const mockTeammatesWithLowerIds = {
      1: { id: 1, name: 'Some Ball 1', team: 1 },
      2: { id: 2, name: 'Some Ball 2', team: 1 },
    };
    const mockGetTeammatesWithLowerIds = sinon.stub().returns(mockTeammatesWithLowerIds);
    GameStateRewireAPI.__Rewire__('getTeammatesWithLowerIds', mockGetTeammatesWithLowerIds);
    const mockPlayerRoles = { 1: ROLES.OFFENSE, 2: ROLES.DEFENSE, 3: ROLES.NOT_DEFINED };
    GameStateRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);

    t.is(isMyTurnToAssumeRole(), true);

    GameStateRewireAPI.__ResetDependency__('cleanTeammateRoles');
    GameStateRewireAPI.__ResetDependency__('getTeammatesWithLowerIds');
    GameStateRewireAPI.__ResetDependency__('playerRoles');
    t.end();
  });

  tester.test('returns false when an older teammate has a not defined role', t => {
    const mockCleanTeammateRoles = sinon.stub();
    GameStateRewireAPI.__Rewire__('cleanTeammateRoles', mockCleanTeammateRoles);
    const mockTeammatesWithLowerIds = {
      1: { id: 1, name: 'Some Ball 1', team: 1 },
      2: { id: 2, name: 'Some Ball 2', team: 1 },
    };
    const mockGetTeammatesWithLowerIds = sinon.stub().returns(mockTeammatesWithLowerIds);
    GameStateRewireAPI.__Rewire__('getTeammatesWithLowerIds', mockGetTeammatesWithLowerIds);
    const mockPlayerRoles = { 1: ROLES.OFFENSE, 2: ROLES.NOT_DEFINED, 3: ROLES.NOT_DEFINED };
    GameStateRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);

    t.is(isMyTurnToAssumeRole(), false);

    GameStateRewireAPI.__ResetDependency__('cleanTeammateRoles');
    GameStateRewireAPI.__ResetDependency__('getTeammatesWithLowerIds');
    GameStateRewireAPI.__ResetDependency__('playerRoles');
    t.end();
  });
});
