import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GameState, Prediction, OwnTeamPrediction } from './store';
import * as api from './api';

export interface SessionContextType {
  state: GameState | null;
  stateLoading: boolean;
  error: string | null;
  updateSettings: (settings: { currentWeek?: number; broadcastTitle?: string; guestEnabled?: boolean }) => Promise<void>;
  updateParticipant: (participantId: string, data: { name?: string; score?: number; slotCount?: number; ownTeamId?: string; ownTeamName?: string }) => Promise<void>;
  addPrediction: (participantId: string, prediction: Prediction) => Promise<void>;
  removePrediction: (participantId: string, predictionId: string) => Promise<void>;
  setOwnTeamPrediction: (participantId: string, prediction: OwnTeamPrediction) => Promise<void>;
  deleteOwnTeamPrediction: (participantId: string) => Promise<void>;
  clearPredictions: () => Promise<void>;
  refetchState: () => void;
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
    mutationFn: (settings: { currentWeek?: number; broadcastTitle?: string; guestEnabled?: boolean }) => {
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

  return {
    state,
    stateLoading,
    error,
    updateSettings: useCallback((settings) => updateSettingsMutation.mutateAsync(settings).then(() => {}), [updateSettingsMutation]),
    updateParticipant: useCallback((participantId, data) => updateParticipantMutation.mutateAsync({ participantId, data }).then(() => {}), [updateParticipantMutation]),
    addPrediction: useCallback((participantId, prediction) => addPredictionMutation.mutateAsync({ participantId, prediction }).then(() => {}), [addPredictionMutation]),
    removePrediction: useCallback((participantId, predictionId) => removePredictionMutation.mutateAsync({ participantId, predictionId }).then(() => {}), [removePredictionMutation]),
    setOwnTeamPrediction: useCallback((participantId, prediction) => setOwnTeamPredictionMutation.mutateAsync({ participantId, prediction }).then(() => {}), [setOwnTeamPredictionMutation]),
    deleteOwnTeamPrediction: useCallback((participantId) => deleteOwnTeamPredictionMutation.mutateAsync(participantId), [deleteOwnTeamPredictionMutation]),
    clearPredictions: useCallback(() => clearPredictionsMutation.mutateAsync().then(() => {}), [clearPredictionsMutation]),
    refetchState: useCallback(() => refetchState(), [refetchState]),
  };
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
