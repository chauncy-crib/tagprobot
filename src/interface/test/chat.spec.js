import test from 'tape';
import sinon from 'sinon';
import addMilliseconds from 'date-fns/add_milliseconds';
import subMilliseconds from 'date-fns/sub_milliseconds';

import { ROLES } from '../../look/constants';
import { CHATS, KEY_WORDS } from '../constants';
import {
  sendMessageToChat,
  dequeueChatMessages,
  parseChatForCommunication,
  __RewireAPI__ as ChatRewireAPI,
} from '../chat';


test('sendMessageToChat()', tester => {
  tester.test('queues messages in the correct order with back-to-back calls', t => {
    const mockQueue = [];
    ChatRewireAPI.__Rewire__('messageQueue', mockQueue);

    sendMessageToChat(CHATS.ALL, 'one');
    sendMessageToChat(CHATS.TEAM, 'two');
    sendMessageToChat(CHATS.ALL, 'three');
    sendMessageToChat(CHATS.TEAM, 'four');
    t.same(mockQueue, [
      { chat: CHATS.ALL, message: 'one' },
      { chat: CHATS.TEAM, message: 'two' },
      { chat: CHATS.ALL, message: 'three' },
      { chat: CHATS.TEAM, message: 'four' },
    ]);

    ChatRewireAPI.__ResetDependency__('messageQueue');
    t.end();
  });
});


test('dequeueChatMessages()', tester => {
  tester.test('chats first message of the program and dequeues the queue', t => {
    const mockQueue = [{ chat: CHATS.ALL, message: 'one' }, { chat: CHATS.TEAM, message: 'two' }];
    const mockEmit = sinon.spy();

    ChatRewireAPI.__Rewire__('messageQueue', mockQueue);
    global.tagpro = { socket: { emit: mockEmit } };

    dequeueChatMessages();

    t.true(mockEmit.calledWith('chat', {
      message: 'one',
      toAll: true,
    }));
    t.same(mockQueue, [{ chat: CHATS.TEAM, message: 'two' }]);

    global.tagpro = undefined;
    ChatRewireAPI.__ResetDependency__('messageQueue');
    t.end();
  });

  tester.test('chats if lastMessageTime is >600ms ago', t => {
    const mockQueue = [{ chat: CHATS.TEAM, message: 'one' }, { chat: CHATS.ALL, message: 'two' }];
    const mockLastMessageTime = subMilliseconds(new Date(), 5000); // 5s in the past
    const mockEmit = sinon.spy();

    ChatRewireAPI.__Rewire__('messageQueue', mockQueue);
    ChatRewireAPI.__Rewire__('lastMessageTime', mockLastMessageTime);
    global.tagpro = { socket: { emit: mockEmit } };

    dequeueChatMessages();

    t.true(mockEmit.calledWith('chat', {
      message: 'one',
      toAll: false,
    }));
    t.same(mockQueue, [{ chat: CHATS.ALL, message: 'two' }]);

    global.tagpro = undefined;
    ChatRewireAPI.__ResetDependency__('messageQueue');
    ChatRewireAPI.__ResetDependency__('lastMessageTime');
    t.end();
  });

  tester.test('does not sendMessageToChat if lastMessageTime is <600ms ago', t => {
    const mockQueue = ['one', 'two', 'three'];
    const mockLastMessageTime = addMilliseconds(new Date(), 5000); // 5s in the future
    const mockEmit = sinon.spy();

    ChatRewireAPI.__Rewire__('messageQueue', mockQueue);
    ChatRewireAPI.__Rewire__('lastMessageTime', mockLastMessageTime);
    global.tagpro = { socket: { emit: mockEmit } };

    dequeueChatMessages();

    t.true(mockEmit.notCalled);
    t.same(mockQueue, ['one', 'two', 'three']);

    global.tagpro = undefined;
    ChatRewireAPI.__ResetDependency__('messageQueue');
    ChatRewireAPI.__ResetDependency__('lastMessageTime');
    t.end();
  });
});

test('parseChatForCommunication()', tester => {
  tester.test('role is not assumed if not my turn to assume role', t => {
    const mockIdIsMine = sinon.stub().returns(false);
    ChatRewireAPI.__Rewire__('idIsMine', mockIdIsMine);
    const mockGetMyRole = sinon.stub().returns(ROLES.NOT_DEFINED);
    ChatRewireAPI.__Rewire__('getMyRole', mockGetMyRole);
    const mockIsMyTurnToAssumeRole = sinon.stub().returns(false);
    ChatRewireAPI.__Rewire__('isMyTurnToAssumeRole', mockIsMyTurnToAssumeRole);
    const mockAssumeComplementaryRole = sinon.spy();
    ChatRewireAPI.__Rewire__('assumeComplementaryRole', mockAssumeComplementaryRole);

    const mockChatData = { from: 'mockId', message: `${KEY_WORDS.INFORM.ROLE} ${ROLES.DEFENSE}` };
    parseChatForCommunication(mockChatData);
    t.is(mockAssumeComplementaryRole.callCount, 0);

    ChatRewireAPI.__ResetDependency__('idIsMine');
    ChatRewireAPI.__ResetDependency__('getMyRole');
    ChatRewireAPI.__ResetDependency__('isMyTurnToAssumeRole');
    ChatRewireAPI.__ResetDependency__('assumeComplementaryRole');
    t.end();
  });

  tester.test('role is assumed if it is my turn to assume role', t => {
    const mockIdIsMine = sinon.stub().returns(false);
    ChatRewireAPI.__Rewire__('idIsMine', mockIdIsMine);
    const mockGetMyRole = sinon.stub().returns(ROLES.NOT_DEFINED);
    ChatRewireAPI.__Rewire__('getMyRole', mockGetMyRole);
    const mockIsMyTurnToAssumeRole = sinon.stub().returns(true);
    ChatRewireAPI.__Rewire__('isMyTurnToAssumeRole', mockIsMyTurnToAssumeRole);
    const mockAssumeComplementaryRole = sinon.spy();
    ChatRewireAPI.__Rewire__('assumeComplementaryRole', mockAssumeComplementaryRole);

    const mockChatData = { from: 'mockId', message: `${KEY_WORDS.INFORM.ROLE} ${ROLES.DEFENSE}` };
    parseChatForCommunication(mockChatData);
    t.is(mockAssumeComplementaryRole.callCount, 1);

    ChatRewireAPI.__ResetDependency__('idIsMine');
    ChatRewireAPI.__ResetDependency__('getMyRole');
    ChatRewireAPI.__ResetDependency__('isMyTurnToAssumeRole');
    ChatRewireAPI.__ResetDependency__('assumeComplementaryRole');
    t.end();
  });
});
