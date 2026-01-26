import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team } from '../lib/graphql';
import type { PredictionType } from '../lib/store';
import { Button, Card } from './ui';
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react';

interface TeamSelectorProps {
  teams: Team[];
  onSelect: (team: Team, type: PredictionType, reasoning: string) => void;
  onClose: () => void;
  disabledTeamIds?: string[];
}

export function TeamSelector({ teams, onSelect, onClose, disabledTeamIds = [] }: TeamSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [predictionType, setPredictionType] = useState<PredictionType>('favorite');
  const [reasoning, setReasoning] = useState('');

  const filteredTeams = useMemo(() => {
    const searchLower = search.toLowerCase();
    return teams.filter(
      team =>
        !disabledTeamIds.includes(team.id) &&
        (team.name.toLowerCase().includes(searchLower) ||
          team.franchise.name.toLowerCase().includes(searchLower) ||
          team.franchise.prefix.toLowerCase().includes(searchLower))
    );
  }, [teams, search, disabledTeamIds]);

  const tierGroups = useMemo(() => {
    const groups: Record<string, Team[]> = {};
    filteredTeams.forEach(team => {
      const tierName = team.tier?.name || 'Unknown';
      if (!groups[tierName]) groups[tierName] = [];
      groups[tierName].push(team);
    });
    return groups;
  }, [filteredTeams]);

  const handleConfirm = () => {
    if (selectedTeam) {
      onSelect(selectedTeam, predictionType, reasoning);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-csc-dark border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Select Team</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6 max-h-[calc(90vh-200px)] overflow-hidden">
          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                placeholder="Search teams..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-csc-accent"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {Object.entries(tierGroups).map(([tierName, tierTeams]) => (
                <div key={tierName}>
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">
                    {tierName}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tierTeams.map(team => (
                      <button
                        key={team.id}
                        onClick={() => setSelectedTeam(team)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedTeam?.id === team.id
                            ? 'border-csc-accent bg-csc-accent/20'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {team.franchise.logo ? (
                            <img
                              src={team.franchise.logo}
                              alt={team.franchise.name}
                              className="w-8 h-8 rounded object-contain"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold">
                              {team.franchise.prefix}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate text-sm">
                              {team.name}
                            </div>
                            <div className="text-xs text-white/50">{team.franchise.prefix}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {selectedTeam ? (
                <motion.div
                  key={selectedTeam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <Card className="p-4">
                    <div className="flex items-center gap-4">
                      {selectedTeam.franchise.logo ? (
                        <img
                          src={selectedTeam.franchise.logo}
                          alt={selectedTeam.franchise.name}
                          className="w-16 h-16 rounded-lg object-contain bg-white/10"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-xl font-bold">
                          {selectedTeam.franchise.prefix}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-white">{selectedTeam.name}</h3>
                        <p className="text-white/60">{selectedTeam.franchise.name}</p>
                        <p className="text-sm text-white/40">{selectedTeam.tier?.name}</p>
                      </div>
                    </div>
                  </Card>

                  <div>
                    <label className="text-sm font-medium text-white/70 mb-2 block">
                      Prediction Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPredictionType('favorite')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          predictionType === 'favorite'
                            ? 'border-csc-green bg-csc-green/20'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <TrendingUp
                          size={24}
                          className={predictionType === 'favorite' ? 'text-csc-green' : 'text-white/60'}
                        />
                        <div className="mt-2 font-semibold text-white">Favorite</div>
                        <div className="text-xs text-white/60">2-0 = 3 pts</div>
                      </button>
                      <button
                        onClick={() => setPredictionType('underdog')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          predictionType === 'underdog'
                            ? 'border-csc-gold bg-csc-gold/20'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <TrendingDown
                          size={24}
                          className={predictionType === 'underdog' ? 'text-csc-gold' : 'text-white/60'}
                        />
                        <div className="mt-2 font-semibold text-white">Sleeper</div>
                        <div className="text-xs text-white/60">1-1 = 2 pts</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/70 mb-2 block">
                      Reasoning (Optional)
                    </label>
                    <textarea
                      value={reasoning}
                      onChange={e => setReasoning(e.target.value)}
                      placeholder="Why will this team perform this way?"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-csc-accent resize-none h-24"
                    />
                  </div>

                  <Button onClick={handleConfirm} className="w-full" size="lg">
                    Confirm Selection
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex items-center justify-center text-white/40"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">👈</div>
                    <p>Select a team from the list</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
