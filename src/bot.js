import { isAutonomousMode, isVisualMode, move } from './interface/keys';
import { dequeueChatMessages } from './interface/chat';
import { getAccelValues } from './control/physics';


/**
 * The base loop for defining the bot's behavior.
 */
export default function botLoop() {
  dequeueChatMessages();
  if (isAutonomousMode()) {
    move(getAccelValues());
  } else if (isVisualMode()) {
    getAccelValues();
  }
}
