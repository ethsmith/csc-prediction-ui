import { createContext, useContext } from 'react';

export type PredictionType = 'favorite' | 'underdog';

export interface Prediction {
  id: string;
  teamId: string;
  teamName: string;
  teamLogo?: string;
  franchisePrefix: string;
  type: PredictionType;
  reasoning?: string;
  revealed: boolean;
  result?: '2-0' | '1-1' | '0-2';
}

export interface OwnTeamPrediction {
  id: string;
  teamId: string;
  teamName: string;
  teamLogo?: string;
  franchisePrefix: string;
  predictedRecord: '2-0' | '1-1' | '0-2';
  reasoning?: string;
  revealed: boolean;
  actualRecord?: '2-0' | '1-1' | '0-2';
}

export interface Participant {
  id: string;
  name: string;
  role: 'host' | 'cohost' | 'guest';
  score: number;
  ownTeamId?: string;
  ownTeamName?: string;
  predictions: Prediction[];
  ownTeamPrediction?: OwnTeamPrediction;
  slotCount: number;
}

export interface GameState {
  participants: Participant[];
  currentWeek: number;
  currentTurn: string;
  guestEnabled: boolean;
  revealInProgress: boolean;
  currentRevealIndex: number;
  broadcastTitle: string;
}

export const defaultHost: Participant = {
  id: 'host',
  name: 'Host',
  role: 'host',
  score: 0,
  predictions: [],
  slotCount: 2,
};

export const defaultCohost: Participant = {
  id: 'cohost',
  name: 'Co-Host',
  role: 'cohost',
  score: 0,
  predictions: [],
  slotCount: 2,
};

export const defaultGuest: Participant = {
  id: 'guest',
  name: 'Guest',
  role: 'guest',
  score: 0,
  predictions: [],
  slotCount: 2,
};

export const initialGameState: GameState = {
  participants: [defaultHost, defaultCohost],
  currentWeek: 1,
  currentTurn: 'host',
  guestEnabled: false,
  revealInProgress: false,
  currentRevealIndex: -1,
  broadcastTitle: 'CSC PREDICTION CHALLENGE',
};

export type GameAction =
  | { type: 'SET_PARTICIPANT_NAME'; participantId: string; name: string }
  | { type: 'SET_PARTICIPANT_SCORE'; participantId: string; score: number }
  | { type: 'SET_PARTICIPANT_OWN_TEAM'; participantId: string; teamId: string; teamName: string }
  | { type: 'SET_SLOT_COUNT'; participantId: string; count: number }
  | { type: 'ADD_PREDICTION'; participantId: string; prediction: Prediction }
  | { type: 'REMOVE_PREDICTION'; participantId: string; predictionId: string }
  | { type: 'SET_OWN_TEAM_PREDICTION'; participantId: string; prediction: OwnTeamPrediction }
  | { type: 'TOGGLE_GUEST'; enabled: boolean }
  | { type: 'SET_WEEK'; week: number }
  | { type: 'SET_TURN'; participantId: string }
  | { type: 'START_REVEAL' }
  | { type: 'REVEAL_NEXT' }
  | { type: 'STOP_REVEAL' }
  | { type: 'SET_PREDICTION_REVEALED'; participantId: string; predictionId: string; revealed: boolean }
  | { type: 'SET_OWN_TEAM_REVEALED'; participantId: string; revealed: boolean }
  | { type: 'CLEAR_PREDICTIONS' }
  | { type: 'SET_BROADCAST_TITLE'; title: string }
  | { type: 'LOAD_STATE'; state: GameState };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PARTICIPANT_NAME':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.participantId ? { ...p, name: action.name } : p
        ),
      };

    case 'SET_PARTICIPANT_SCORE':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.participantId ? { ...p, score: action.score } : p
        ),
      };

    case 'SET_PARTICIPANT_OWN_TEAM':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.participantId
            ? { ...p, ownTeamId: action.teamId, ownTeamName: action.teamName }
            : p
        ),
      };

    case 'SET_SLOT_COUNT':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.participantId ? { ...p, slotCount: action.count } : p
        ),
      };

    case 'ADD_PREDICTION':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.participantId
            ? { ...p, predictions: [...p.predictions, action.prediction] }
            : p
        ),
      };

    case 'REMOVE_PREDICTION':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.participantId
            ? { ...p, predictions: p.predictions.filter(pred => pred.id !== action.predictionId) }
            : p
        ),
      };

    case 'SET_OWN_TEAM_PREDICTION':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.participantId
            ? { ...p, ownTeamPrediction: action.prediction }
            : p
        ),
      };

    case 'TOGGLE_GUEST': {
      const hasGuest = state.participants.some(p => p.role === 'guest');
      if (action.enabled && !hasGuest) {
        return {
          ...state,
          guestEnabled: true,
          participants: [...state.participants, { ...defaultGuest }],
        };
      } else if (!action.enabled && hasGuest) {
        return {
          ...state,
          guestEnabled: false,
          participants: state.participants.filter(p => p.role !== 'guest'),
        };
      }
      return { ...state, guestEnabled: action.enabled };
    }

    case 'SET_WEEK':
      return { ...state, currentWeek: action.week };

    case 'SET_TURN':
      return { ...state, currentTurn: action.participantId };

    case 'START_REVEAL':
      return { ...state, revealInProgress: true, currentRevealIndex: 0 };

    case 'REVEAL_NEXT':
      return { ...state, currentRevealIndex: state.currentRevealIndex + 1 };

    case 'STOP_REVEAL':
      return { ...state, revealInProgress: false, currentRevealIndex: -1 };

    case 'SET_PREDICTION_REVEALED':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.participantId
            ? {
                ...p,
                predictions: p.predictions.map(pred =>
                  pred.id === action.predictionId ? { ...pred, revealed: action.revealed } : pred
                ),
              }
            : p
        ),
      };

    case 'SET_OWN_TEAM_REVEALED':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.participantId && p.ownTeamPrediction
            ? { ...p, ownTeamPrediction: { ...p.ownTeamPrediction, revealed: action.revealed } }
            : p
        ),
      };

    case 'CLEAR_PREDICTIONS':
      return {
        ...state,
        participants: state.participants.map(p => ({
          ...p,
          predictions: [],
          ownTeamPrediction: undefined,
        })),
      };

    case 'SET_BROADCAST_TITLE':
      return { ...state, broadcastTitle: action.title };

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}

export interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function calculatePoints(prediction: Prediction, actualRecord: '2-0' | '1-1' | '0-2'): number {
  if (prediction.type === 'favorite') {
    return actualRecord === '2-0' ? 3 : 0;
  } else {
    return actualRecord === '1-1' ? 2 : 0;
  }
}

export function calculateOwnTeamPoints(prediction: OwnTeamPrediction): number {
  if (prediction.actualRecord && prediction.predictedRecord === prediction.actualRecord) {
    return 1;
  }
  return 0;
}
