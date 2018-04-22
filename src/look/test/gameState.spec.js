import test from 'tape';

import { cleanTeammateRoles, __RewireAPI__ as GameStateRewireAPI } from '../gameState';


test.only('cleanTeammateRoles', tester => {
  tester.test('removes roles for players that are no longer in the game', t => {
    const mockTagproPlayers = { 2: { id: 2, name: 'Some Ball 2', team: 1 } };
    global.tagpro = { players: mockTagproPlayers };
    const mockPlayerRoles = { 1: 'OFFENSE', 2: 'DEFENSE' };
    GameStateRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);

    cleanTeammateRoles();
    t.same(mockPlayerRoles, { 2: 'DEFENSE' });

    global.tagpro = undefined;
    GameStateRewireAPI.__ResetDependency__('playerRoles');
    t.end();
  });

  tester.test('assigns ROLES.NOT_DEFINED roles to players that are not bots', t => {
    const mockTagproPlayers = {
      1: { id: 1, name: 'Some Ball 1', team: 1 },
      2: { id: 2, name: 'Some Ball', team: 1 },
      3: { id: 3, name: '1730 asdf asdf gasd 3', team: 1 },
    };
    global.tagpro = { players: mockTagproPlayers };
    const mockPlayerRoles = {};
    GameStateRewireAPI.__Rewire__('playerRoles', mockPlayerRoles);

    cleanTeammateRoles();
    t.same(mockPlayerRoles, { 2: 'NOT_DEFINED', 3: 'NOT_DEFINED' });

    global.tagpro = undefined;
    GameStateRewireAPI.__ResetDependency__('playerRoles');
    t.end();
  });
});
