export type View = 0 | 1 | 2 | 3 | 4;
export type Phase = 'sealed' | 'flap' | 'extract' | 'settle' | 'reading';
export type MotionState = { phase: Phase; view: View; busy: boolean };
export type MotionAction = { type: 'GO_TO'; view: View } | { type: 'OPEN' | 'ADVANCE' | 'FINISH_TURN' | 'REPLAY' } | { type: 'NAVIGATE'; direction: -1 | 1; mobile: boolean };
export const initialMotion: MotionState = { phase: 'sealed', view: 0, busy: false };
export const openingDurations = { flap: 620, extract: 650, settle: 800 };
export const turnDuration = 920;
export function motionReducer(state: MotionState, action: MotionAction): MotionState {
  switch (action.type) {
    case 'GO_TO': return state.phase === 'reading' && !state.busy && state.view !== action.view ? { ...state, view: action.view, busy: true } : state;
    case 'OPEN': return state.phase === 'sealed' ? { ...state, phase: 'flap', busy: true } : state;
    case 'ADVANCE': {
      const phases: Phase[] = ['flap', 'extract', 'settle', 'reading'];
      const index = phases.indexOf(state.phase);
      if (index < 0 || index === phases.length - 1) return state;
      const phase = phases[index + 1];
      return { ...state, phase, busy: phase !== 'reading' };
    }
    case 'FINISH_TURN': return state.phase === 'reading' ? { ...state, busy: false } : state;
    case 'NAVIGATE': {
      if (state.phase !== 'reading' || state.busy) return state;
      const pages: View[] = action.mobile ? [0, 1, 2, 3, 4] : [0, 1, 3, 4];
      const current = !action.mobile && state.view === 2 ? 1 : state.view;
      const target = pages[pages.indexOf(current) + action.direction];
      return target === undefined ? state : { ...state, view: target, busy: true };
    }
    case 'REPLAY': return state.phase === 'reading' && !state.busy ? initialMotion : state;
  }
}
