import { recalculateKMatrices } from './lqr';


export default function worker(self) {
  self.addEventListener('message', ev => {
    if (ev.data.text === 'RECALCULATE_K_MATRICES') {
      const { goalState, deadline } = ev.data;
      const Ks = recalculateKMatrices(goalState, deadline);

      self.postMessage({ text: 'DONE', Ks: JSON.stringify(Ks) });
    }
  });
}
