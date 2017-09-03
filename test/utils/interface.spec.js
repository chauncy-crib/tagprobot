import test from 'tape';
import sinon from 'sinon';
import {
  chat,
  dequeueMessages,
  __RewireAPI__ as RewireAPI,
} from '../../src/utils/interface';


test('chat()', tester => {
  tester.test('queues messages in the correct order with back-to-back calls', t => {
    const mockQueue = [];
    RewireAPI.__Rewire__('messageQueue', mockQueue);

    chat('one');
    chat('two');
    chat('three');
    chat('four');

    t.deepEqual(mockQueue, ['one', 'two', 'three', 'four']);
    RewireAPI.__ResetDependency__('messageQueue');
    t.end();
  });
  tester.end();
});

test('dequeueMessages()', tester => {
  tester.test('chats with correct delay between calls', t => {
    const callTimes = [];
    const emitSpy = sinon.stub().callsFake(() => {
      callTimes.push(new Date());
    });
    const mockQueue = ['one', 'two', 'three'];
    const mockDelay = 50; // To make this test faster

    RewireAPI.__Rewire__('messageQueue', mockQueue);
    RewireAPI.__Rewire__('chatDelay', mockDelay);
    global.tagpro = { socket: { emit: emitSpy } };

    // Call dequeueMessages in a loop to simulate the botLoop
    const mockLoop = setInterval(() => {
      dequeueMessages();
      if (!mockQueue.length) {
        // Check if adjacent calls are made with minimum delay (1ms buffer for rounding)
        t.true(callTimes[1] - callTimes[0] > mockDelay - 1);
        t.true(callTimes[2] - callTimes[1] > mockDelay - 1);

        global.tagpro = {};
        RewireAPI.__ResetDependency__('messageQueue');
        RewireAPI.__ResetDependency__('chatDelay');
        clearInterval(mockLoop);
        t.end();
      }
    }, 0);
  });
  tester.end();
});
