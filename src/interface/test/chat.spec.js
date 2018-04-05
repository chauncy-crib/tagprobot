import test from 'tape';
import sinon from 'sinon';
import addMilliseconds from 'date-fns/add_milliseconds';
import subMilliseconds from 'date-fns/sub_milliseconds';

import { sendMessageToChat, dequeueChatMessages, __RewireAPI__ as ChatRewireAPI } from '../chat';


test('sendMessageToChat()', tester => {
  tester.test('queues messages in the correct order with back-to-back calls', t => {
    const mockQueue = [];
    ChatRewireAPI.__Rewire__('messageQueue', mockQueue);
    const mockChats = { ALL: 'ALL', TEAM: 'TEAM' };
    ChatRewireAPI.__Rewire__('CHATS', mockChats);

    sendMessageToChat('ALL', 'one');
    sendMessageToChat('TEAM', 'two');
    sendMessageToChat('ALL', 'three');
    sendMessageToChat('TEAM', 'four');

    t.same(mockQueue, [
      { chat: 'ALL', message: 'one' },
      { chat: 'TEAM', message: 'two' },
      { chat: 'ALL', message: 'three' },
      { chat: 'TEAM', message: 'four' },
    ]);
    ChatRewireAPI.__ResetDependency__('messageQueue');
    t.end();
  });
});


test('dequeueChatMessages()', tester => {
  tester.test('chats first message of the program and dequeues the queue', t => {
    const mockQueue = [{ chat: 'ALL', message: 'one' }, { chat: 'TEAM', message: 'two' }];
    const mockEmit = sinon.spy();

    ChatRewireAPI.__Rewire__('messageQueue', mockQueue);
    global.tagpro = { socket: { emit: mockEmit } };

    dequeueChatMessages();

    t.true(mockEmit.calledWith('chat', {
      message: 'one',
      toAll: true,
    }));
    t.same(mockQueue, [{ chat: 'TEAM', message: 'two' }]);

    global.tagpro = undefined;
    ChatRewireAPI.__ResetDependency__('messageQueue');
    t.end();
  });

  tester.test('chats if lastMessageTime is >600ms ago', t => {
    const mockQueue = [{ chat: 'TEAM', message: 'one' }, { chat: 'ALL', message: 'two' }];
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
    t.same(mockQueue, [{ chat: 'ALL', message: 'two' }]);

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
