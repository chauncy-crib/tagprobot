import test from 'tape';
import sinon from 'sinon';
import addMilliseconds from 'date-fns/add_milliseconds';
import subMilliseconds from 'date-fns/sub_milliseconds';

import { chat, dequeueChatMessages, __RewireAPI__ as ChatRewireAPI } from '../chat';


test('chat()', tester => {
  tester.test('queues messages in the correct order with back-to-back calls', t => {
    const mockQueue = [];
    ChatRewireAPI.__Rewire__('messageQueue', mockQueue);

    chat('one');
    chat('two');
    chat('three');
    chat('four');

    t.same(mockQueue, ['one', 'two', 'three', 'four']);
    ChatRewireAPI.__ResetDependency__('messageQueue');
    t.end();
  });
  tester.end();
});


test('dequeueChatMessages()', tester => {
  tester.test('chats first message of the program and dequeues the queue', t => {
    const mockQueue = ['one', 'two', 'three'];
    const mockEmit = sinon.spy();

    ChatRewireAPI.__Rewire__('messageQueue', mockQueue);
    global.tagpro = { socket: { emit: mockEmit } };

    dequeueChatMessages();

    t.true(mockEmit.calledWith('chat', {
      message: 'one',
      toAll: 0,
    }));
    t.same(mockQueue, ['two', 'three']);

    global.tagpro = undefined;
    ChatRewireAPI.__ResetDependency__('messageQueue');
    t.end();
  });

  tester.test('chats if lastMessageTime is >600ms ago', t => {
    const mockQueue = ['one', 'two', 'three'];
    const mockLastMessageTime = subMilliseconds(new Date(), 5000); // 5s in the past
    const mockEmit = sinon.spy();

    ChatRewireAPI.__Rewire__('messageQueue', mockQueue);
    ChatRewireAPI.__Rewire__('lastMessageTime', mockLastMessageTime);
    global.tagpro = { socket: { emit: mockEmit } };

    dequeueChatMessages();

    t.true(mockEmit.calledWith('chat', {
      message: 'one',
      toAll: 0,
    }));
    t.same(mockQueue, ['two', 'three']);

    global.tagpro = undefined;
    ChatRewireAPI.__ResetDependency__('messageQueue');
    ChatRewireAPI.__ResetDependency__('lastMessageTime');
    t.end();
  });

  tester.test('does not chat if lastMessageTime is <600ms ago', t => {
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
  tester.end();
});
