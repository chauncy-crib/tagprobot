import test from 'tape';

import { ROLES } from '../constants';
import { initMe, cleanTeammateRoles, __RewireAPI__ as GameStateRewireAPI } from '../gameState';


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
