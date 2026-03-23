import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GameState, Prediction, OwnTeamPrediction, PlayoffMatchup, PlayoffScore } from './store';
import * as api from './api';

export interface SessionContextType {
  state: GameState | null;
  stateLoading: boolean;
  error: string | null;
  updateSettings: (settings: { currentWeek?: number; broadcastTitle?: string; guestEnabled?: boolean; selectedTier?: string }) => Promise<void>;
  updateParticipant: (participantId: string, data: { name?: string; score?: number; slotCount?: number; ownTeamId?: string; ownTeamName?: string }) => Promise<void>;
  addPrediction: (participantId: string, prediction: Prediction) => Promise<void>;
  removePrediction: (participantId: string, predictionId: string) => Promise<void>;
  setOwnTeamPrediction: (participantId: string, prediction: OwnTeamPrediction) => Promise<void>;
  deleteOwnTeamPrediction: (participantId: string) => Promise<void>;
  clearPredictions: () => Promise<void>;
  refetchState: () => void;
  togglePredictionReveal: (participantId: string, predictionId: string, revealed: boolean) => Promise<void>;
  toggleOwnTeamReveal: (participantId: string, revealed: boolean) => Promise<void>;
  revealAllPredictions: () => Promise<void>;
  hideAllPredictions: () => Promise<void>;
  // Playoff mode
  togglePlayoffMode: (enabled: boolean) => Promise<void>;
  setPlayoffBracket: (tier: string, matchups: Omit<PlayoffMatchup, 'id'>[]) => Promise<void>;
  updatePlayoffMatchup: (matchupId: string, data: { winner?: string; score?: PlayoffScore; scheduledDate?: string }) => Promise<void>;
  setPlayoffPrediction: (participantId: string, matchupId: string, predictedWinner: string, predictedScore: PlayoffScore) => Promise<void>;
  deletePlayoffPrediction: (participantId: string, matchupId: string) => Promise<void>;
  revealPlayoffPredictions: (matchupId: string, revealed: boolean) => Promise<void>;
  clearPlayoffData: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export function useSessionProvider(): SessionContextType {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [realtimeState, setRealtimeState] = useState<GameState | null>(null);
  const sseCleanupRef = useRef<(() => void) | null>(null);

  // Fetch all sessions and use the first one, or create one if none exist
  const { data: sessionData, isLoading: stateLoading, refetch: refetchState } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const sessions = await api.getSessions();
      if (sessions.length > 0) {
        // Use the first (and only) session
        return await api.getSession(sessions[0].id);
      }
      // No sessions exist, create one
      return await api.createSession('CSC Predictions');
    },
  });

  const sessionId = sessionData?.id ?? null;

  // Subscribe to SSE for real-time updates
  useEffect(() => {
    if (!sessionId) return;

    // Clean up previous subscription
    if (sseCleanupRef.current) {
      sseCleanupRef.current();
    }

    const cleanup = api.subscribeToSession(
      sessionId,
      (newState) => {
        setRealtimeState(newState);
      },
      (err) => {
        console.error('SSE error:', err);
        // On error, fall back to polling
        setError('Real-time connection lost, using polling');
      }
    );

    sseCleanupRef.current = cleanup;

    return () => {
      cleanup();
      sseCleanupRef.current = null;
    };
  }, [sessionId]);

  // Use realtime state if available, otherwise fall back to query data
  const state = realtimeState ?? sessionData?.state ?? null;

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: { currentWeek?: number; broadcastTitle?: string; guestEnabled?: boolean; selectedTier?: string }) => {
      if (!sessionId) throw new Error('No session available');
      return api.updateSettings(sessionId, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Update participant mutation
  const updateParticipantMutation = useMutation({
    mutationFn: ({ participantId, data }: { participantId: string; data: { name?: string; score?: number; slotCount?: number; ownTeamId?: string; ownTeamName?: string } }) => {
      if (!sessionId) throw new Error('No session available');
      return api.updateParticipant(sessionId, participantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Add prediction mutation
  const addPredictionMutation = useMutation({
    mutationFn: ({ participantId, prediction }: { participantId: string; prediction: Prediction }) => {
      if (!sessionId) throw new Error('No session available');
      return api.addPrediction(sessionId, participantId, prediction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Remove prediction mutation
  const removePredictionMutation = useMutation({
    mutationFn: ({ participantId, predictionId }: { participantId: string; predictionId: string }) => {
      if (!sessionId) throw new Error('No session available');
      return api.removePrediction(sessionId, participantId, predictionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Set own team prediction mutation
  const setOwnTeamPredictionMutation = useMutation({
    mutationFn: ({ participantId, prediction }: { participantId: string; prediction: OwnTeamPrediction }) => {
      if (!sessionId) throw new Error('No session available');
      return api.setOwnTeamPrediction(sessionId, participantId, prediction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Delete own team prediction mutation
  const deleteOwnTeamPredictionMutation = useMutation({
    mutationFn: (participantId: string) => {
      if (!sessionId) throw new Error('No session available');
      return api.deleteOwnTeamPrediction(sessionId, participantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Clear predictions mutation
  const clearPredictionsMutation = useMutation({
    mutationFn: () => {
      if (!sessionId) throw new Error('No session available');
      return api.clearPredictions(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Toggle prediction reveal mutation
  const togglePredictionRevealMutation = useMutation({
    mutationFn: ({ participantId, predictionId, revealed }: { participantId: string; predictionId: string; revealed: boolean }) => {
      if (!sessionId) throw new Error('No session available');
      return api.updatePrediction(sessionId, participantId, predictionId, { revealed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Toggle own team reveal mutation
  const toggleOwnTeamRevealMutation = useMutation({
    mutationFn: ({ participantId, revealed }: { participantId: string; revealed: boolean }) => {
      if (!sessionId) throw new Error('No session available');
      return api.updateOwnTeamPrediction(sessionId, participantId, { revealed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Reveal all predictions
  const revealAllPredictions = useCallback(async () => {
    if (!sessionId || !state) return;
    const promises: Promise<unknown>[] = [];
    for (const participant of state.participants) {
      for (const pred of participant.predictions) {
        if (!pred.revealed) {
          promises.push(api.updatePrediction(sessionId, participant.id, pred.id, { revealed: true }));
        }
      }
      if (participant.ownTeamPrediction && !participant.ownTeamPrediction.revealed) {
        promises.push(api.updateOwnTeamPrediction(sessionId, participant.id, { revealed: true }));
      }
    }
    await Promise.all(promises);
    queryClient.invalidateQueries({ queryKey: ['session'] });
  }, [sessionId, state, queryClient]);

  // Hide all predictions
  const hideAllPredictions = useCallback(async () => {
    if (!sessionId || !state) return;
    const promises: Promise<unknown>[] = [];
    for (const participant of state.participants) {
      for (const pred of participant.predictions) {
        if (pred.revealed) {
          promises.push(api.updatePrediction(sessionId, participant.id, pred.id, { revealed: false }));
        }
      }
      if (participant.ownTeamPrediction && participant.ownTeamPrediction.revealed) {
        promises.push(api.updateOwnTeamPrediction(sessionId, participant.id, { revealed: false }));
      }
    }
    await Promise.all(promises);
    queryClient.invalidateQueries({ queryKey: ['session'] });
  }, [sessionId, state, queryClient]);

  // Toggle playoff mode
  const togglePlayoffModeMutation = useMutation({
    mutationFn: (enabled: boolean) => {
      if (!sessionId) throw new Error('No session available');
      return api.togglePlayoffMode(sessionId, enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Set playoff bracket
  const setPlayoffBracketMutation = useMutation({
    mutationFn: ({ tier, matchups }: { tier: string; matchups: Omit<PlayoffMatchup, 'id'>[] }) => {
      if (!sessionId) throw new Error('No session available');
      return api.setPlayoffBracket(sessionId, tier, matchups);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Update playoff matchup
  const updatePlayoffMatchupMutation = useMutation({
    mutationFn: ({ matchupId, data }: { matchupId: string; data: { winner?: string; score?: PlayoffScore; scheduledDate?: string } }) => {
      if (!sessionId) throw new Error('No session available');
      return api.updatePlayoffMatchup(sessionId, matchupId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Set playoff prediction
  const setPlayoffPredictionMutation = useMutation({
    mutationFn: ({ participantId, matchupId, predictedWinner, predictedScore }: { participantId: string; matchupId: string; predictedWinner: string; predictedScore: PlayoffScore }) => {
      if (!sessionId) throw new Error('No session available');
      return api.setPlayoffPrediction(sessionId, participantId, matchupId, predictedWinner, predictedScore);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Delete playoff prediction
  const deletePlayoffPredictionMutation = useMutation({
    mutationFn: ({ participantId, matchupId }: { participantId: string; matchupId: string }) => {
      if (!sessionId) throw new Error('No session available');
      return api.deletePlayoffPrediction(sessionId, participantId, matchupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Reveal playoff predictions for a matchup
  const revealPlayoffPredictionsMutation = useMutation({
    mutationFn: ({ matchupId, revealed }: { matchupId: string; revealed: boolean }) => {
      if (!sessionId) throw new Error('No session available');
      return api.revealPlayoffPredictions(sessionId, matchupId, revealed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Clear playoff data
  const clearPlayoffDataMutation = useMutation({
    mutationFn: () => {
      if (!sessionId) throw new Error('No session available');
      return api.clearPlayoffData(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  return {
    state,
    stateLoading,
    error,
    updateSettings: useCallback((settings: { currentWeek?: number; broadcastTitle?: string; guestEnabled?: boolean; selectedTier?: string }) => updateSettingsMutation.mutateAsync(settings).then(() => {}), [updateSettingsMutation]),
    updateParticipant: useCallback((participantId, data) => updateParticipantMutation.mutateAsync({ participantId, data }).then(() => {}), [updateParticipantMutation]),
    addPrediction: useCallback((participantId, prediction) => addPredictionMutation.mutateAsync({ participantId, prediction }).then(() => {}), [addPredictionMutation]),
    removePrediction: useCallback((participantId, predictionId) => removePredictionMutation.mutateAsync({ participantId, predictionId }).then(() => {}), [removePredictionMutation]),
    setOwnTeamPrediction: useCallback((participantId, prediction) => setOwnTeamPredictionMutation.mutateAsync({ participantId, prediction }).then(() => {}), [setOwnTeamPredictionMutation]),
    deleteOwnTeamPrediction: useCallback((participantId) => deleteOwnTeamPredictionMutation.mutateAsync(participantId), [deleteOwnTeamPredictionMutation]),
    clearPredictions: useCallback(() => clearPredictionsMutation.mutateAsync().then(() => {}), [clearPredictionsMutation]),
    refetchState: useCallback(() => refetchState(), [refetchState]),
    togglePredictionReveal: useCallback((participantId, predictionId, revealed) => togglePredictionRevealMutation.mutateAsync({ participantId, predictionId, revealed }).then(() => {}), [togglePredictionRevealMutation]),
    toggleOwnTeamReveal: useCallback((participantId, revealed) => toggleOwnTeamRevealMutation.mutateAsync({ participantId, revealed }).then(() => {}), [toggleOwnTeamRevealMutation]),
    revealAllPredictions,
    hideAllPredictions,
    // Playoff mode
    togglePlayoffMode: useCallback((enabled: boolean) => togglePlayoffModeMutation.mutateAsync(enabled).then(() => {}), [togglePlayoffModeMutation]),
    setPlayoffBracket: useCallback((tier: string, matchups: Omit<PlayoffMatchup, 'id'>[]) => setPlayoffBracketMutation.mutateAsync({ tier, matchups }).then(() => {}), [setPlayoffBracketMutation]),
    updatePlayoffMatchup: useCallback((matchupId: string, data: { winner?: string; score?: PlayoffScore; scheduledDate?: string }) => updatePlayoffMatchupMutation.mutateAsync({ matchupId, data }).then(() => {}), [updatePlayoffMatchupMutation]),
    setPlayoffPrediction: useCallback((participantId: string, matchupId: string, predictedWinner: string, predictedScore: PlayoffScore) => setPlayoffPredictionMutation.mutateAsync({ participantId, matchupId, predictedWinner, predictedScore }).then(() => {}), [setPlayoffPredictionMutation]),
    deletePlayoffPrediction: useCallback((participantId: string, matchupId: string) => deletePlayoffPredictionMutation.mutateAsync({ participantId, matchupId }).then(() => {}), [deletePlayoffPredictionMutation]),
    revealPlayoffPredictions: useCallback((matchupId: string, revealed: boolean) => revealPlayoffPredictionsMutation.mutateAsync({ matchupId, revealed }).then(() => {}), [revealPlayoffPredictionsMutation]),
    clearPlayoffData: useCallback(() => clearPlayoffDataMutation.mutateAsync().then(() => {}), [clearPlayoffDataMutation]),
  };
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
