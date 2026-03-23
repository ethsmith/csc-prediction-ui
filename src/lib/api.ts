import type { GameState, Prediction, OwnTeamPrediction, PlayoffBracket, PlayoffMatchup, PlayoffPrediction, PlayoffScore } from './store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Session {
  id: string;
  name: string;
  state: GameState;
  createdAt: string;
  updatedAt: string;
}

export interface SessionSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

// Sessions
export async function createSession(name?: string): Promise<Session> {
  const response = await fetch(`${API_BASE}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return handleResponse<Session>(response);
}

export async function getSessions(): Promise<SessionSummary[]> {
  const response = await fetch(`${API_BASE}/api/sessions`);
  return handleResponse<SessionSummary[]>(response);
}

export async function getSession(id: string): Promise<Session> {
  const response = await fetch(`${API_BASE}/api/sessions/${id}`);
  return handleResponse<Session>(response);
}

export async function deleteSession(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/sessions/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

// Game State
export async function getGameState(sessionId: string): Promise<GameState> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/state`);
  return handleResponse<GameState>(response);
}

export async function updateGameState(sessionId: string, state: GameState): Promise<GameState> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  return handleResponse<GameState>(response);
}

export async function patchGameState(sessionId: string, patch: Partial<GameState>): Promise<GameState> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/state`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleResponse<GameState>(response);
}

// Settings
export async function updateSettings(
  sessionId: string,
  settings: { currentWeek?: number; broadcastTitle?: string; guestEnabled?: boolean; selectedTier?: string }
): Promise<GameState> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return handleResponse<GameState>(response);
}

// Participants
export async function updateParticipant(
  sessionId: string,
  participantId: string,
  data: { name?: string; score?: number; slotCount?: number; ownTeamId?: string; ownTeamName?: string }
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/participants/${participantId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<void>(response);
}

// Predictions
export async function addPrediction(
  sessionId: string,
  participantId: string,
  prediction: Omit<Prediction, 'revealed'> & { revealed?: boolean }
): Promise<Prediction> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/participants/${participantId}/predictions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prediction),
  });
  return handleResponse<Prediction>(response);
}

export async function removePrediction(
  sessionId: string,
  participantId: string,
  predictionId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/sessions/${sessionId}/participants/${participantId}/predictions/${predictionId}`,
    { method: 'DELETE' }
  );
  return handleResponse<void>(response);
}

export async function updatePrediction(
  sessionId: string,
  participantId: string,
  predictionId: string,
  data: { revealed?: boolean; result?: '2-0' | '1-1' | '0-2'; reasoning?: string }
): Promise<Prediction> {
  const response = await fetch(
    `${API_BASE}/api/sessions/${sessionId}/participants/${participantId}/predictions/${predictionId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return handleResponse<Prediction>(response);
}

// Own Team Prediction
export async function setOwnTeamPrediction(
  sessionId: string,
  participantId: string,
  prediction: Omit<OwnTeamPrediction, 'revealed'> & { revealed?: boolean }
): Promise<OwnTeamPrediction> {
  const response = await fetch(
    `${API_BASE}/api/sessions/${sessionId}/participants/${participantId}/own-team-prediction`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prediction),
    }
  );
  return handleResponse<OwnTeamPrediction>(response);
}

export async function deleteOwnTeamPrediction(sessionId: string, participantId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/sessions/${sessionId}/participants/${participantId}/own-team-prediction`,
    { method: 'DELETE' }
  );
  return handleResponse<void>(response);
}

export async function updateOwnTeamPrediction(
  sessionId: string,
  participantId: string,
  data: { revealed?: boolean; actualRecord?: '2-0' | '1-1' | '0-2'; reasoning?: string }
): Promise<OwnTeamPrediction> {
  const response = await fetch(
    `${API_BASE}/api/sessions/${sessionId}/participants/${participantId}/own-team-prediction`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return handleResponse<OwnTeamPrediction>(response);
}

// Clear all predictions
export async function clearPredictions(sessionId: string): Promise<GameState> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/clear-predictions`, {
    method: 'POST',
  });
  return handleResponse<GameState>(response);
}

// Health check
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE}/api/health`);
  return handleResponse<{ status: string; timestamp: string }>(response);
}

// ==================== PLAYOFF MODE API ====================

// Toggle playoff mode
export async function togglePlayoffMode(sessionId: string, enabled: boolean): Promise<{ playoffMode: boolean }> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/playoff-mode`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  return handleResponse<{ playoffMode: boolean }>(response);
}

// Set/update playoff bracket
export async function setPlayoffBracket(
  sessionId: string,
  tier: string,
  matchups: Omit<PlayoffMatchup, 'id'>[]
): Promise<PlayoffBracket> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/playoff-bracket`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier, matchups }),
  });
  return handleResponse<PlayoffBracket>(response);
}

// Get playoff bracket
export async function getPlayoffBracket(sessionId: string): Promise<PlayoffBracket | null> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/playoff-bracket`);
  return handleResponse<PlayoffBracket | null>(response);
}

// Update a matchup (set winner/score)
export async function updatePlayoffMatchup(
  sessionId: string,
  matchupId: string,
  data: { winner?: string; score?: PlayoffScore; scheduledDate?: string }
): Promise<PlayoffMatchup> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/playoff-bracket/matchups/${matchupId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<PlayoffMatchup>(response);
}

// Get all playoff predictions
export async function getPlayoffPredictions(sessionId: string): Promise<PlayoffPrediction[]> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/playoff-predictions`);
  return handleResponse<PlayoffPrediction[]>(response);
}

// Get participant's playoff predictions
export async function getParticipantPlayoffPredictions(
  sessionId: string,
  participantId: string
): Promise<PlayoffPrediction[]> {
  const response = await fetch(
    `${API_BASE}/api/sessions/${sessionId}/participants/${participantId}/playoff-predictions`
  );
  return handleResponse<PlayoffPrediction[]>(response);
}

// Set playoff prediction
export async function setPlayoffPrediction(
  sessionId: string,
  participantId: string,
  matchupId: string,
  predictedWinner: string,
  predictedScore: PlayoffScore
): Promise<PlayoffPrediction> {
  const response = await fetch(
    `${API_BASE}/api/sessions/${sessionId}/participants/${participantId}/playoff-predictions/${matchupId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ predictedWinner, predictedScore }),
    }
  );
  return handleResponse<PlayoffPrediction>(response);
}

// Delete playoff prediction
export async function deletePlayoffPrediction(
  sessionId: string,
  participantId: string,
  matchupId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/sessions/${sessionId}/participants/${participantId}/playoff-predictions/${matchupId}`,
    { method: 'DELETE' }
  );
  return handleResponse<void>(response);
}

// Reveal/hide playoff predictions for a matchup
export async function revealPlayoffPredictions(
  sessionId: string,
  matchupId: string,
  revealed: boolean
): Promise<PlayoffPrediction[]> {
  const response = await fetch(
    `${API_BASE}/api/sessions/${sessionId}/playoff-predictions/matchup/${matchupId}/reveal`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revealed }),
    }
  );
  return handleResponse<PlayoffPrediction[]>(response);
}

// Clear all playoff data
export async function clearPlayoffData(sessionId: string): Promise<GameState> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/clear-playoff`, {
    method: 'POST',
  });
  return handleResponse<GameState>(response);
}

// SSE subscription for real-time updates
export function subscribeToSession(
  sessionId: string,
  onStateUpdate: (state: GameState) => void,
  onError?: (error: Error) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/api/sessions/${sessionId}/events`);

  eventSource.addEventListener('state-update', (event) => {
    try {
      const state = JSON.parse(event.data) as GameState;
      onStateUpdate(state);
    } catch (e) {
      console.error('Failed to parse state update:', e);
    }
  });

  eventSource.addEventListener('connected', (event) => {
    console.log('SSE connected:', JSON.parse(event.data));
  });

  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    onError?.(new Error('SSE connection error'));
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}
