import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { useSession } from '../lib/useSession';
import type { Prediction, OwnTeamPrediction } from '../lib/store';
import { fetchTeams } from '../lib/graphql';
import type { Team } from '../lib/graphql';
import { ParticipantCard } from '../components/ParticipantCard';
import { TeamSelector } from '../components/TeamSelector';
import { OwnTeamSelector } from '../components/OwnTeamSelector';
import { Button, Card, Input, Select } from '../components/ui';
import { Settings, Plus, RotateCcw, Eye, Users, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HostPanel() {
  const {
    state,
    stateLoading,
    updateSettings,
    updateParticipant,
    addPrediction: apiAddPrediction,
    removePrediction: apiRemovePrediction,
    setOwnTeamPrediction: apiSetOwnTeamPrediction,
    deleteOwnTeamPrediction,
    clearPredictions,
  } = useSession();

  const [showSettings, setShowSettings] = useState(false);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [showOwnTeamSelector, setShowOwnTeamSelector] = useState(false);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [revealedSlots, setRevealedSlots] = useState<Set<string>>(new Set());

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });

  const activeParticipant = state?.participants.find(p => p.id === activeParticipantId);

  const handleAddPrediction = (participantId: string) => {
    setActiveParticipantId(participantId);
    setShowTeamSelector(true);
  };

  const handleAddOwnTeamPrediction = (participantId: string) => {
    setActiveParticipantId(participantId);
    setShowOwnTeamSelector(true);
  };

  const handleTeamSelect = async (team: Team, type: 'favorite' | 'underdog', reasoning: string) => {
    if (!activeParticipantId) return;

    const prediction: Prediction = {
      id: `pred-${Date.now()}`,
      teamId: team.id,
      teamName: team.name,
      teamLogo: team.franchise.logo,
      franchisePrefix: team.franchise.prefix,
      type,
      reasoning,
      revealed: false,
    };

    await apiAddPrediction(activeParticipantId, prediction);
    setShowTeamSelector(false);
    setActiveParticipantId(null);
  };

  const handleOwnTeamSelect = async (predictedRecord: '2-0' | '1-1' | '0-2', reasoning: string) => {
    if (!activeParticipantId || !activeParticipant) return;

    const ownTeam = teams.find(t => t.id === activeParticipant.ownTeamId);
    if (!ownTeam) return;

    const prediction: OwnTeamPrediction = {
      id: `own-${Date.now()}`,
      teamId: ownTeam.id,
      teamName: ownTeam.name,
      teamLogo: ownTeam.franchise.logo,
      franchisePrefix: ownTeam.franchise.prefix,
      predictedRecord,
      reasoning,
      revealed: false,
    };

    await apiSetOwnTeamPrediction(activeParticipantId, prediction);
    setShowOwnTeamSelector(false);
    setActiveParticipantId(null);
  };

  const handleRevealAll = () => {
    if (!state) return;
    const allSlotIds = new Set<string>();
    state.participants.forEach(p => {
      p.predictions.forEach(pred => allSlotIds.add(pred.id));
      if (p.ownTeamPrediction) allSlotIds.add(p.ownTeamPrediction.id);
    });
    setRevealedSlots(allSlotIds);
  };

  const handleHideAll = () => {
    setRevealedSlots(new Set());
  };

  const handleRevealNext = () => {
    if (!state) return;
    const regularSlots: string[] = [];
    const ownTeamSlots: string[] = [];
    
    state.participants.forEach(p => {
      p.predictions.forEach(pred => regularSlots.push(pred.id));
      if (p.ownTeamPrediction) ownTeamSlots.push(p.ownTeamPrediction.id);
    });

    const allSlots = [...regularSlots, ...ownTeamSlots];
    const nextUnrevealed = allSlots.find(id => !revealedSlots.has(id));
    if (nextUnrevealed) {
      setRevealedSlots(prev => new Set([...prev, nextUnrevealed]));
    }
  };

  const getUsedTeamIds = (participantId: string) => {
    if (!state) return [];
    const participant = state.participants.find(p => p.id === participantId);
    if (!participant) return [];
    return participant.predictions.map(p => p.teamId);
  };

  if (stateLoading || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">CSC Prediction Challenge</h1>
            <p className="text-white/60">Week {state.currentWeek} - Host Control Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/broadcast">
              <Button variant="secondary" className="flex items-center gap-2">
                <Eye size={18} />
                Broadcast View
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2"
            >
              <Settings size={18} />
              Settings
            </Button>
          </div>
        </header>

        <AnimatePresence>
          {showSettings && (
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings size={20} />
                Settings
              </h2>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">General</h3>
                    <div className="space-y-4">
                      <Input
                        label="Broadcast Title"
                        type="text"
                        value={state.broadcastTitle}
                        onChange={e => updateSettings({ broadcastTitle: e.target.value })}
                      />
                      <Input
                        label="Current Week"
                        type="number"
                        min={1}
                        value={state.currentWeek}
                        onChange={e => updateSettings({ currentWeek: parseInt(e.target.value) || 1 })}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Enable Guest</span>
                        <button
                          onClick={() => updateSettings({ guestEnabled: !state.guestEnabled })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            state.guestEnabled ? 'bg-csc-accent' : 'bg-white/20'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              state.guestEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="secondary" onClick={handleRevealAll} className="flex items-center gap-2">
                        <Eye size={16} />
                        Reveal All
                      </Button>
                      <Button variant="ghost" onClick={handleHideAll} className="flex items-center gap-2">
                        <RotateCcw size={16} />
                        Hide All
                      </Button>
                      <Button variant="secondary" onClick={handleRevealNext} className="flex items-center gap-2">
                        <ChevronRight size={16} />
                        Reveal Next
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => clearPredictions()}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw size={16} />
                        Clear All Predictions
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Participants</h3>
                  {state.participants.map(participant => (
                    <Card key={participant.id} className="p-4 space-y-4">
                      <div className="flex items-center gap-4">
                        <Users size={20} className="text-white/60" />
                        <Input
                          value={participant.name}
                          onChange={e =>
                            updateParticipant(participant.id, { name: e.target.value })
                          }
                          className="flex-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Score"
                          type="number"
                          value={participant.score}
                          onChange={e =>
                            updateParticipant(participant.id, { score: parseInt(e.target.value) || 0 })
                          }
                        />
                        <Input
                          label="Slots"
                          type="number"
                          min={1}
                          max={5}
                          value={participant.slotCount}
                          onChange={e =>
                            updateParticipant(participant.id, { slotCount: parseInt(e.target.value) || 2 })
                          }
                        />
                      </div>
                      <Select
                        label="Own Team"
                        value={participant.ownTeamId || ''}
                        onChange={e => {
                          const team = teams.find(t => t.id === e.target.value);
                          if (team) {
                            updateParticipant(participant.id, {
                              ownTeamId: team.id,
                              ownTeamName: team.name,
                            });
                          }
                        }}
                        options={[
                          { value: '', label: 'Select team...' },
                          ...teams.map(t => ({ value: t.id, label: `${t.franchise.prefix} - ${t.name}` })),
                        ]}
                      />
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {state.participants.map(participant => (
            <div key={participant.id}>
              <ParticipantCard
                participant={participant}
                isCurrentTurn={state.currentTurn === participant.id}
                showControls={true}
                revealedSlots={revealedSlots}
                onRemovePrediction={predId =>
                  apiRemovePrediction(participant.id, predId)
                }
                onRemoveOwnTeamPrediction={() =>
                  deleteOwnTeamPrediction(participant.id)
                }
              />
              <div className="flex gap-3 mt-4 ml-6">
                {participant.predictions.length < participant.slotCount && (
                  <Button
                    variant="secondary"
                    onClick={() => handleAddPrediction(participant.id)}
                    disabled={teamsLoading}
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Prediction ({participant.predictions.length}/{participant.slotCount})
                  </Button>
                )}
                {!participant.ownTeamPrediction && participant.ownTeamId && (
                  <Button
                    variant="secondary"
                    onClick={() => handleAddOwnTeamPrediction(participant.id)}
                    className="flex items-center gap-2 border-csc-gold/50"
                  >
                    <Plus size={16} />
                    Add Own Team Prediction
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showTeamSelector && activeParticipantId && (
          <TeamSelector
            teams={teams}
            onSelect={handleTeamSelect}
            onClose={() => {
              setShowTeamSelector(false);
              setActiveParticipantId(null);
            }}
            disabledTeamIds={getUsedTeamIds(activeParticipantId)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOwnTeamSelector && activeParticipant && activeParticipant.ownTeamId && (
          <OwnTeamSelector
            team={teams.find(t => t.id === activeParticipant.ownTeamId)!}
            onSelect={handleOwnTeamSelect}
            onClose={() => {
              setShowOwnTeamSelector(false);
              setActiveParticipantId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
