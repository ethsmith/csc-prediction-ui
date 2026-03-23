import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayoffMatchup, PlayoffTeam, PlayoffPrediction, PlayoffScore, Participant } from '../lib/store';
import type { Team } from '../lib/graphql';
import { Button, Card, Select } from './ui';
import { Trophy, Plus, Trash2, Eye, EyeOff, Check, X, GripVertical, Calendar } from 'lucide-react';

interface PlayoffBracketSetupProps {
  bracket?: { tier: string; matchups: PlayoffMatchup[] };
  predictions: PlayoffPrediction[];
  participants: Participant[];
  teams: Team[];
  availableTiers: string[];
  onSetBracket: (tier: string, matchups: Omit<PlayoffMatchup, 'id'>[]) => Promise<void>;
  onUpdateMatchup: (matchupId: string, data: { winner?: string; score?: PlayoffScore }) => Promise<void>;
  onSetPrediction: (participantId: string, matchupId: string, predictedWinner: string, predictedScore: PlayoffScore) => Promise<void>;
  onDeletePrediction: (participantId: string, matchupId: string) => Promise<void>;
  onRevealPredictions: (matchupId: string, revealed: boolean) => Promise<void>;
}

// Dark-themed dropdown component
function DarkSelect({ 
  value, 
  onChange, 
  options, 
  placeholder,
  className = '',
  disabled = false
}: { 
  value: string; 
  onChange: (value: string) => void; 
  options: { value: string; label: string; logo?: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full bg-csc-dark border rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between transition-colors ${
          disabled 
            ? 'border-white/10 opacity-50 cursor-not-allowed' 
            : 'border-white/30 hover:border-csc-accent hover:bg-csc-dark/80 cursor-pointer'
        }`}
      >
        <span className={selectedOption ? 'text-white font-medium' : 'text-white/70'}>
          {selectedOption ? selectedOption.label : placeholder || 'Select...'}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${disabled ? 'text-white/30' : 'text-white/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <AnimatePresence>
        {isOpen && !disabled && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-[101] w-full mt-1 bg-csc-darker border border-white/20 rounded-lg shadow-2xl max-h-60 overflow-auto"
            >
              {options.map((option, idx) => (
                <button
                  key={option.value || `empty-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-white/10 transition-colors ${
                    option.value === value ? 'bg-csc-accent/20 text-csc-accent' : 'text-white'
                  }`}
                >
                  {option.logo && (
                    <img src={option.logo} alt="" className="w-5 h-5 rounded object-contain" />
                  )}
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Date picker component
function DatePicker({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (date: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year] = useState(new Date().getFullYear());

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const handleDateSelect = (day: number) => {
    const formatted = `${month + 1}/${day}`;
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-csc-dark border border-white/20 rounded-lg px-3 py-2 text-sm text-white hover:border-white/40 transition-colors"
      >
        <Calendar size={14} className="text-white/50" />
        <span className={value ? 'text-white' : 'text-white/50'}>
          {value || 'Date'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-1 bg-csc-darker border border-white/20 rounded-lg shadow-xl p-3 w-64"
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setMonth(m => m > 0 ? m - 1 : 11)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-white font-semibold">{months[month]} {year}</span>
                <button
                  type="button"
                  onClick={() => setMonth(m => m < 11 ? m + 1 : 0)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-white/50 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = value === `${month + 1}/${day}`;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateSelect(day)}
                      className={`p-1 text-sm rounded hover:bg-csc-accent/30 transition-colors ${
                        isSelected ? 'bg-csc-accent text-white' : 'text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Draggable team card
function DraggableTeam({ 
  team, 
  onDragStart 
}: { 
  team: Team; 
  onDragStart: (team: Team) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(team)}
      className="flex items-center gap-2 bg-csc-dark border border-white/20 rounded-lg px-2 py-1.5 cursor-grab active:cursor-grabbing hover:border-csc-accent/50 transition-colors"
    >
      <GripVertical size={12} className="text-white/30" />
      {team.franchise.logo && (
        <img src={team.franchise.logo} alt="" className="w-5 h-5 rounded object-contain" />
      )}
      <span className="text-xs text-white font-medium">[{team.franchise.prefix}]</span>
      <span className="text-xs text-white/70 truncate">{team.name}</span>
    </div>
  );
}

// Drop zone for teams
function TeamDropZone({ 
  team, 
  seed,
  onDrop, 
  onSeedChange,
  onClear,
  label 
}: { 
  team?: PlayoffTeam; 
  seed: number;
  onDrop: (team: Team, seed: number) => void;
  onSeedChange: (seed: number) => void;
  onClear: () => void;
  label: string;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const teamData = e.dataTransfer.getData('team');
    if (teamData) {
      const droppedTeam = JSON.parse(teamData) as Team;
      onDrop(droppedTeam, seed);
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label className="text-xs text-white/50">{label}</label>
        <input
          type="number"
          min={1}
          max={16}
          value={seed || ''}
          onChange={e => onSeedChange(parseInt(e.target.value) || 1)}
          className="w-10 bg-csc-dark border border-white/20 rounded px-1.5 py-0.5 text-xs text-white text-center"
          placeholder="#"
        />
      </div>
      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`min-h-[40px] rounded-lg border-2 border-dashed transition-colors flex items-center px-2 ${
          isDragOver 
            ? 'border-csc-accent bg-csc-accent/10' 
            : team 
            ? 'border-white/20 bg-csc-dark' 
            : 'border-white/10 bg-white/5'
        }`}
      >
        {team ? (
          <div className="flex items-center gap-2 flex-1">
            {team.teamLogo && (
              <img src={team.teamLogo} alt="" className="w-5 h-5 rounded object-contain" />
            )}
            <span className="text-xs text-white font-medium">[{team.franchisePrefix}]</span>
            <span className="text-xs text-white/70 truncate flex-1">{team.teamName}</span>
            <button
              type="button"
              onClick={onClear}
              className="p-0.5 hover:bg-white/10 rounded"
            >
              <X size={12} className="text-white/50" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-white/30">Drop team here</span>
        )}
      </div>
    </div>
  );
}

export function PlayoffBracketSetup({
  bracket,
  predictions,
  participants,
  teams,
  availableTiers,
  onSetBracket,
  onUpdateMatchup,
  onSetPrediction,
  onDeletePrediction,
  onRevealPredictions,
}: PlayoffBracketSetupProps) {
  const [selectedTier, setSelectedTier] = useState(bracket?.tier || '');
  const [matchups, setMatchups] = useState<Omit<PlayoffMatchup, 'id'>[]>(
    bracket?.matchups.map(m => ({ ...m })) || []
  );
  const [isEditing, setIsEditing] = useState(!bracket);
  const [draggedTeam, setDraggedTeam] = useState<Team | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);

  // Sync matchups from bracket when entering edit mode or when bracket changes
  const startEditing = () => {
    if (bracket) {
      setMatchups(bracket.matchups.map(m => ({ ...m })));
      setSelectedTier(bracket.tier);
    }
    setIsEditing(true);
  };

  const tierTeams = useMemo(() => {
    return teams.filter(t => t.tier?.name === selectedTier);
  }, [teams, selectedTier]);

  // Get unique winners from completed matchups (they can be used in later rounds)
  const winnersFromCompletedMatchups = useMemo(() => {
    const winnersMap = new Map<string, PlayoffTeam>();
    matchups.forEach(m => {
      if (m.winner) {
        // Find the winning team
        const winningTeam = m.winner === m.team1?.teamId ? m.team1 : m.team2;
        if (winningTeam && !winnersMap.has(winningTeam.teamId)) {
          winnersMap.set(winningTeam.teamId, winningTeam);
        }
      }
    });
    return Array.from(winnersMap.values());
  }, [matchups]);

  const usedTeamIds = useMemo(() => {
    const ids = new Set<string>();
    matchups.forEach(m => {
      if (m.team1?.teamId) ids.add(m.team1.teamId);
      if (m.team2?.teamId) ids.add(m.team2.teamId);
    });
    return ids;
  }, [matchups]);

  // Available teams = unused teams from tier + winners from completed matchups (who aren't already placed in a later round)
  const availableTeams = useMemo(() => {
    const unusedTierTeams = tierTeams.filter(t => !usedTeamIds.has(t.id));
    
    // Convert winners to Team format and add them if they're not already used in another matchup
    // Winners can be reused because they advance to the next round
    const winnerTeams = winnersFromCompletedMatchups
      .filter(w => {
        // Count how many times this team has WON (they can advance after each win)
        let wins = 0;
        matchups.forEach(m => {
          if (m.winner === w.teamId) wins++;
        });
        
        // Count how many times this team appears in matchups
        let appearances = 0;
        matchups.forEach(m => {
          if (m.team1?.teamId === w.teamId) appearances++;
          if (m.team2?.teamId === w.teamId) appearances++;
        });
        
        // A team can appear (wins + 1) times total - once for each round they've advanced to
        // If appearances < wins + 1, they can be placed in the next round
        return appearances < wins + 1;
      })
      .map(w => ({
        id: w.teamId,
        name: w.teamName,
        tier: { name: selectedTier },
        franchise: {
          prefix: w.franchisePrefix,
          logo: w.teamLogo,
        },
      } as Team));
    
    return [...unusedTierTeams, ...winnerTeams];
  }, [tierTeams, usedTeamIds, winnersFromCompletedMatchups, matchups, selectedTier]);

  const addMatchup = () => {
    const newMatchup: Omit<PlayoffMatchup, 'id'> = {
      round: 1,
      position: matchups.length,
    };
    setMatchups([...matchups, newMatchup]);
  };

  const removeMatchup = (index: number) => {
    setMatchups(matchups.filter((_, i) => i !== index));
  };

  const updateMatchupTeam = (index: number, teamNum: 1 | 2, team: Team | null, seed: number) => {
    const updated = [...matchups];
    const playoffTeam: PlayoffTeam | undefined = team ? {
      teamId: team.id,
      teamName: team.name,
      teamLogo: team.franchise.logo,
      franchisePrefix: team.franchise.prefix,
      seed,
    } : undefined;

    if (teamNum === 1) {
      updated[index] = { ...updated[index], team1: playoffTeam };
    } else {
      updated[index] = { ...updated[index], team2: playoffTeam };
    }
    setMatchups(updated);
  };

  const updateMatchupRound = (index: number, round: number) => {
    const updated = [...matchups];
    updated[index] = { ...updated[index], round };
    setMatchups(updated);
  };

  const updateMatchupDate = (index: number, date: string) => {
    const updated = [...matchups];
    updated[index] = { ...updated[index], scheduledDate: date };
    setMatchups(updated);
  };

  const handleTeamDrop = (index: number, teamNum: 1 | 2, team: Team, seed: number) => {
    updateMatchupTeam(index, teamNum, team, seed);
  };

  const handleDragStart = (team: Team) => {
    setDraggedTeam(team);
  };

  const saveBracket = async () => {
    if (!selectedTier || matchups.length === 0) return;
    await onSetBracket(selectedTier, matchups);
    setIsEditing(false);
  };

  const getMatchupPredictions = (matchupId: string) => {
    return predictions.filter(p => p.matchupId === matchupId);
  };

  const areAllPredictionsRevealed = (matchupId: string) => {
    const preds = getMatchupPredictions(matchupId);
    return preds.length > 0 && preds.every(p => p.revealed);
  };

  // Handle drag data transfer
  const handleDragStartWithData = (e: React.DragEvent, team: Team) => {
    e.dataTransfer.setData('team', JSON.stringify(team));
    handleDragStart(team);
  };

  if (isEditing || !bracket) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-csc-gold" />
          Setup Playoff Bracket
        </h3>

        <div className="space-y-4">
          <Select
            label="Playoff Tier"
            value={selectedTier}
            onChange={e => setSelectedTier(e.target.value)}
            options={[
              { value: '', label: 'Select tier...' },
              ...availableTiers.map(tier => ({ value: tier, label: tier })),
            ]}
          />

          {selectedTier && (
            <div className="grid grid-cols-3 gap-6">
              {/* Available Teams */}
              <div className="col-span-1">
                <h4 className="text-sm font-semibold text-white/70 mb-2">Available Teams</h4>
                <div className="bg-csc-darker rounded-lg border border-white/10 p-2 max-h-96 overflow-y-auto space-y-1">
                  {availableTeams.length > 0 ? (
                    availableTeams.map(team => (
                      <div
                        key={team.id}
                        draggable
                        onDragStart={e => handleDragStartWithData(e, team)}
                        className="flex items-center gap-2 bg-csc-dark border border-white/20 rounded-lg px-2 py-1.5 cursor-grab active:cursor-grabbing hover:border-csc-accent/50 transition-colors"
                      >
                        <GripVertical size={12} className="text-white/30" />
                        {team.franchise.logo && (
                          <img src={team.franchise.logo} alt="" className="w-5 h-5 rounded object-contain" />
                        )}
                        <span className="text-xs text-white font-medium">[{team.franchise.prefix}]</span>
                        <span className="text-xs text-white/70 truncate">{team.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/30 text-center py-4">All teams assigned</p>
                  )}
                </div>
              </div>

              {/* Matchups */}
              <div className="col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h4 className="text-sm font-semibold text-white/70">Matchups</h4>
                    <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hideCompleted}
                        onChange={e => setHideCompleted(e.target.checked)}
                        className="rounded border-white/20 bg-csc-dark"
                      />
                      Hide completed
                    </label>
                  </div>
                  <Button variant="secondary" onClick={addMatchup} className="flex items-center gap-1 text-sm">
                    <Plus size={14} />
                    Add Matchup
                  </Button>
                </div>

                {matchups.filter(m => !hideCompleted || !m.winner).map((matchup) => {
                  // Get the actual index in the matchups array for updates
                  const actualIndex = matchups.indexOf(matchup);
                  return (
                  <Card key={actualIndex} className="p-3 bg-csc-darker">
                    <div className="flex items-center gap-3 mb-3">
                      <DarkSelect
                        value={String(matchup.round)}
                        onChange={v => updateMatchupRound(actualIndex, parseInt(v))}
                        options={[1, 2, 3, 4, 5].map(r => ({ value: String(r), label: `Round ${r}` }))}
                        className="w-32"
                      />
                      <DatePicker
                        value={matchup.scheduledDate || ''}
                        onChange={date => updateMatchupDate(actualIndex, date)}
                      />
                      <div className="flex-1" />
                      <Button variant="ghost" onClick={() => removeMatchup(actualIndex)} className="p-1">
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <TeamDropZone
                        team={matchup.team1}
                        seed={matchup.team1?.seed || 1}
                        onDrop={(team, seed) => handleTeamDrop(actualIndex, 1, team, seed)}
                        onSeedChange={seed => {
                          if (matchup.team1) {
                            const updated = [...matchups];
                            updated[actualIndex] = { ...updated[actualIndex], team1: { ...matchup.team1, seed } };
                            setMatchups(updated);
                          }
                        }}
                        onClear={() => updateMatchupTeam(actualIndex, 1, null, 1)}
                        label="Team 1"
                      />
                      <TeamDropZone
                        team={matchup.team2}
                        seed={matchup.team2?.seed || 1}
                        onDrop={(team, seed) => handleTeamDrop(actualIndex, 2, team, seed)}
                        onSeedChange={seed => {
                          if (matchup.team2) {
                            const updated = [...matchups];
                            updated[actualIndex] = { ...updated[actualIndex], team2: { ...matchup.team2, seed } };
                            setMatchups(updated);
                          }
                        }}
                        onClear={() => updateMatchupTeam(actualIndex, 2, null, 1)}
                        label="Team 2"
                      />
                    </div>
                  </Card>
                  );
                })}

                {matchups.length === 0 && (
                  <div className="text-center py-8 text-white/30">
                    <p>No matchups yet. Click "Add Matchup" to start.</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="primary" onClick={saveBracket} disabled={matchups.length === 0}>
                    Save Bracket
                  </Button>
                  {bracket && (
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Display mode - show bracket with controls
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy size={20} className="text-csc-gold" />
          {bracket.tier} Playoff Bracket
        </h3>
        <Button variant="secondary" onClick={startEditing} className="text-sm">
          Edit Bracket
        </Button>
      </div>

      <div className="space-y-4 relative">
        {bracket.matchups.map((matchup, index) => {
          const matchupPredictions = getMatchupPredictions(matchup.id);
          const allRevealed = areAllPredictionsRevealed(matchup.id);

          return (
            <Card key={matchup.id} className="p-4 bg-csc-darker overflow-visible relative" style={{ zIndex: bracket.matchups.length - index }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-csc-gold/20 text-csc-gold px-2 py-0.5 rounded">
                    Round {matchup.round}
                  </span>
                  {matchup.scheduledDate && (
                    <span className="text-xs text-white/50">{matchup.scheduledDate}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {matchupPredictions.length > 0 && (
                    <Button
                      variant="ghost"
                      onClick={() => onRevealPredictions(matchup.id, !allRevealed)}
                      className="text-xs flex items-center gap-1"
                    >
                      {allRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                      {allRevealed ? 'Hide' : 'Reveal'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Teams */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className={`p-2 rounded ${matchup.winner === matchup.team1?.teamId ? 'bg-csc-green/20 border border-csc-green/50' : 'bg-white/5'}`}>
                  {matchup.team1 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-csc-gold">{matchup.team1.seed}</span>
                      {matchup.team1.teamLogo && (
                        <img src={matchup.team1.teamLogo} alt="" className="w-6 h-6 rounded" />
                      )}
                      <span className="text-sm text-white font-semibold">
                        [{matchup.team1.franchisePrefix}] {matchup.team1.teamName}
                      </span>
                      {matchup.winner === matchup.team1.teamId && <Trophy size={14} className="text-csc-gold" />}
                    </div>
                  ) : (
                    <span className="text-sm text-white/30">TBD</span>
                  )}
                </div>
                <div className={`p-2 rounded ${matchup.winner === matchup.team2?.teamId ? 'bg-csc-green/20 border border-csc-green/50' : 'bg-white/5'}`}>
                  {matchup.team2 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-csc-gold">{matchup.team2.seed}</span>
                      {matchup.team2.teamLogo && (
                        <img src={matchup.team2.teamLogo} alt="" className="w-6 h-6 rounded" />
                      )}
                      <span className="text-sm text-white font-semibold">
                        [{matchup.team2.franchisePrefix}] {matchup.team2.teamName}
                      </span>
                      {matchup.winner === matchup.team2.teamId && <Trophy size={14} className="text-csc-gold" />}
                    </div>
                  ) : (
                    <span className="text-sm text-white/30">TBD</span>
                  )}
                </div>
              </div>

              {/* Set Result */}
              {matchup.team1 && matchup.team2 && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded">
                  <span className="text-xs text-white/50">Set Result:</span>
                  <DarkSelect
                    value={matchup.winner || ''}
                    onChange={v => {
                      // Allow clearing the winner by selecting empty value - use empty string instead of undefined so it's included in JSON
                      onUpdateMatchup(matchup.id, { winner: v, score: v ? matchup.score : '' });
                    }}
                    options={[
                      { value: '', label: matchup.winner ? '❌ Clear winner' : 'Select winner...' },
                      { value: matchup.team1.teamId, label: matchup.team1.franchisePrefix, logo: matchup.team1.teamLogo },
                      { value: matchup.team2.teamId, label: matchup.team2.franchisePrefix, logo: matchup.team2.teamLogo },
                    ]}
                    className="w-40"
                  />
                  <DarkSelect
                    value={matchup.score || ''}
                    onChange={v => {
                      if (v && matchup.winner) onUpdateMatchup(matchup.id, { score: v as PlayoffScore });
                    }}
                    options={[
                      { value: '', label: 'Score...' },
                      { value: '2-0', label: '2-0' },
                      { value: '2-1', label: '2-1' },
                    ]}
                    className="w-24"
                  />
                </div>
              )}

              {/* Predictions */}
              <div className="border-t border-white/10 pt-3 relative z-10">
                <h4 className="text-xs text-white/50 mb-2">Predictions</h4>
                <div className="space-y-3 relative">
                  {participants.map(participant => {
                    const pred = matchupPredictions.find(p => p.participantId === participant.id);
                    const roleColors = {
                      host: 'text-csc-accent border-csc-accent/30',
                      cohost: 'text-purple-400 border-purple-400/30',
                      guest: 'text-csc-gold border-csc-gold/30',
                    };
                    
                    return (
                      <div key={participant.id} className="flex items-center gap-3">
                        <span className={`text-sm font-medium w-20 ${roleColors[participant.role].split(' ')[0]}`}>
                          {participant.name}:
                        </span>
                        {pred ? (
                          <div className="flex items-center gap-2 flex-1">
                            <AnimatePresence mode="wait">
                              {pred.revealed ? (
                                <motion.div
                                  initial={{ rotateY: 90 }}
                                  animate={{ rotateY: 0 }}
                                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                                    pred.scoreCorrect === true
                                      ? 'bg-csc-green/20 text-csc-green'
                                      : (pred.correct === false || pred.correct === true)
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-white/10 text-white'
                                  }`}
                                >
                                  {pred.predictedWinner === matchup.team1?.teamId
                                    ? matchup.team1?.franchisePrefix
                                    : matchup.team2?.franchisePrefix}
                                  {' '}({pred.predictedScore})
                                  {pred.scoreCorrect === true && <Check size={14} />}
                                  {(pred.correct === false || (pred.correct === true && !pred.scoreCorrect)) && <X size={14} />}
                                </motion.div>
                              ) : (
                                <motion.div className="px-2 py-1 rounded text-sm bg-csc-blue/20 text-csc-accent">
                                  Hidden
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <Button
                              variant="ghost"
                              onClick={() => onDeletePrediction(participant.id, matchup.id)}
                              className="p-1"
                            >
                              <Trash2 size={12} className="text-red-400" />
                            </Button>
                          </div>
                        ) : matchup.team1 && matchup.team2 ? (
                          <PredictionInput
                            matchup={matchup}
                            onSubmit={(winner, score) => onSetPrediction(participant.id, matchup.id, winner, score)}
                          />
                        ) : (
                          <span className="text-xs text-white/30">Waiting for teams...</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

function PredictionInput({
  matchup,
  onSubmit,
}: {
  matchup: PlayoffMatchup;
  onSubmit: (winner: string, score: PlayoffScore) => void;
}) {
  const [winner, setWinner] = useState('');
  const [score, setScore] = useState<PlayoffScore | ''>('');

  const handleSubmit = () => {
    if (winner && score) {
      onSubmit(winner, score);
      setWinner('');
      setScore('');
    }
  };

  return (
    <div className="flex items-center gap-2 flex-1">
      <DarkSelect
        value={winner}
        onChange={setWinner}
        options={[
          { value: '', label: 'Pick...' },
          { value: matchup.team1?.teamId || '', label: matchup.team1?.franchisePrefix || '', logo: matchup.team1?.teamLogo },
          { value: matchup.team2?.teamId || '', label: matchup.team2?.franchisePrefix || '', logo: matchup.team2?.teamLogo },
        ]}
        placeholder="Pick..."
        className="w-28"
      />
      <DarkSelect
        value={score}
        onChange={v => setScore(v as PlayoffScore | '')}
        options={[
          { value: '', label: 'Score...' },
          { value: '2-0', label: '2-0' },
          { value: '2-1', label: '2-1' },
        ]}
        placeholder="Score..."
        className="w-24"
      />
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={!winner || !score}
        className={`p-2 text-xs transition-all ${winner && score ? 'bg-csc-accent hover:bg-csc-accent/80' : 'opacity-50'}`}
      >
        <Plus size={14} />
      </Button>
    </div>
  );
}
