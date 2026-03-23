import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '../lib/useSession';
import { fetchTeams } from '../lib/graphql';
import type { Participant, Prediction, OwnTeamPrediction } from '../lib/store';
import { Trophy, TrendingUp, TrendingDown, Target, Mic, User, Users, Loader2 } from 'lucide-react';
import { PlayoffBracketView, PlayoffParticipantCard } from '../components/PlayoffBracket';

function BroadcastPredictionSlot({
  prediction,
  slotType,
  slotNumber,
  revealed,
  animationDelay = 0,
}: {
  prediction?: Prediction | OwnTeamPrediction;
  slotType: 'regular' | 'ownTeam';
  slotNumber: number;
  revealed: boolean;
  animationDelay?: number;
}) {
  const isEmpty = !prediction;
  const isPred = prediction && 'type' in prediction;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className={`relative rounded-xl overflow-hidden ${
        slotType === 'ownTeam'
          ? 'bg-gradient-to-br from-csc-gold/20 to-csc-gold/5 border-2 border-csc-gold/40'
          : 'bg-gradient-to-br from-white/10 to-white/5 border-2 border-csc-accent/30'
      }`}
      style={{ minHeight: '220px' }}
    >
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center text-white/30">
              <div className="text-7xl font-black mb-2">
                {slotType === 'ownTeam' ? '🏠' : slotNumber}
              </div>
              <div className="text-lg uppercase tracking-widest font-bold">
                {slotType === 'ownTeam' ? 'Own Team' : 'Pending'}
              </div>
            </div>
          </motion.div>
        ) : !revealed ? (
          <motion.div
            key="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-csc-blue via-csc-dark to-csc-blue p-4"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {prediction.teamLogo ? (
                <img
                  src={prediction.teamLogo}
                  alt={prediction.teamName}
                  className="w-28 h-28 rounded-xl object-contain"
                />
              ) : (
                <div className="w-28 h-28 rounded-xl bg-white/10 flex items-center justify-center text-4xl font-black">
                  {prediction.franchisePrefix}
                </div>
              )}
            </motion.div>
            <div className="text-lg mt-3 text-white font-bold text-center">
              {prediction.teamName}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center"
          >
            {prediction.teamLogo ? (
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                src={prediction.teamLogo}
                alt={prediction.teamName}
                className="w-24 h-24 rounded-xl object-contain bg-white/10 p-1"
              />
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="w-24 h-24 rounded-xl bg-gradient-to-br from-csc-accent/30 to-csc-blue flex items-center justify-center text-2xl font-black"
              >
                {prediction.franchisePrefix}
              </motion.div>
            )}
            
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="font-bold text-white text-lg mt-2 mb-2"
            >
              {prediction.teamName}
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {isPred ? (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black whitespace-nowrap ${
                    (prediction as Prediction).type === 'favorite'
                      ? 'bg-csc-green/30 text-csc-green border border-csc-green/50'
                      : 'bg-csc-gold/30 text-csc-gold border border-csc-gold/50'
                  }`}
                >
                  {(prediction as Prediction).type === 'favorite' ? (
                    <>
                      <TrendingUp size={14} />
                      FAVORITE 2-0
                    </>
                  ) : (
                    <>
                      <TrendingDown size={14} />
                      SLEEPER 1-1
                    </>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black whitespace-nowrap bg-csc-accent/30 text-csc-accent border border-csc-accent/50">
                  <Target size={14} />
                  {(prediction as OwnTeamPrediction).predictedRecord}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BroadcastParticipantCard({
  participant,
  side,
}: {
  participant: Participant;
  side: 'left' | 'right';
}) {
  const roleIcon = {
    host: <Mic size={20} />,
    cohost: <User size={20} />,
    guest: <Users size={20} />,
  };

  const roleGradients = {
    host: 'from-csc-accent via-blue-500 to-csc-accent',
    cohost: 'from-purple-500 via-pink-500 to-purple-500',
    guest: 'from-csc-gold via-orange-500 to-csc-gold',
  };

  return (
    <motion.div
      initial={{ x: side === 'left' ? -100 : 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r opacity-20 blur-xl rounded-3xl" 
           style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
      
      <div className="relative bg-csc-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${roleGradients[participant.role]}`} />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 20px rgba(0,212,255,0.3)', '0 0 40px rgba(0,212,255,0.5)', '0 0 20px rgba(0,212,255,0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`p-3 rounded-xl bg-gradient-to-br ${roleGradients[participant.role]}`}
              >
                {roleIcon[participant.role]}
              </motion.div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">
                  {participant.name}
                </h3>
                <p className="text-base text-white/60 uppercase tracking-widest font-bold">
                  {participant.role}
                </p>
              </div>
            </div>

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 bg-gradient-to-r from-csc-gold/20 to-csc-gold/10 rounded-xl px-5 py-3 border border-csc-gold/30"
            >
              <Trophy size={32} className="text-csc-gold" />
              <div className="text-right">
                <div className="text-4xl font-black text-white">{participant.score}</div>
                <div className="text-sm text-csc-gold uppercase tracking-widest font-bold">Points</div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: participant.slotCount }).map((_, index) => {
                const prediction = participant.predictions[index];
                const slotId = prediction?.id || `empty-${participant.id}-${index}`;
                const isRevealed = prediction ? prediction.revealed : false;

                return (
                  <BroadcastPredictionSlot
                    key={slotId}
                    prediction={prediction}
                    slotType="regular"
                    slotNumber={index + 1}
                    revealed={isRevealed}
                    animationDelay={index * 0.1}
                  />
                );
              })}
            </div>
            <div className="flex justify-center">
              <div className="w-1/2">
                <BroadcastPredictionSlot
                  prediction={participant.ownTeamPrediction}
                  slotType="ownTeam"
                  slotNumber={0}
                  revealed={
                    participant.ownTeamPrediction
                      ? participant.ownTeamPrediction.revealed
                      : false
                  }
                  animationDelay={participant.slotCount * 0.1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function BroadcastView() {
  const { state, stateLoading } = useSession();

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });

  const selectedTeamIds = useMemo(() => {
    if (!state) return new Set<string>();
    const ids = new Set<string>();
    for (const participant of state.participants) {
      for (const pred of participant.predictions) {
        ids.add(pred.teamId);
      }
    }
    return ids;
  }, [state]);

  const availableFranchises = useMemo(() => {
    if (!state?.selectedTier) return [];
    
    const tierTeams = teams.filter(t => t.tier?.name === state.selectedTier);
    const franchiseMap = new Map<string, { prefix: string; logo?: string; hasAvailableTeam: boolean }>();
    
    for (const team of tierTeams) {
      const prefix = team.franchise.prefix;
      const existing = franchiseMap.get(prefix);
      const isAvailable = !selectedTeamIds.has(team.id);
      
      if (!existing) {
        franchiseMap.set(prefix, {
          prefix,
          logo: team.franchise.logo,
          hasAvailableTeam: isAvailable,
        });
      } else if (isAvailable) {
        existing.hasAvailableTeam = true;
      }
    }
    
    return Array.from(franchiseMap.values())
      .filter(f => f.hasAvailableTeam)
      .sort((a, b) => a.prefix.localeCompare(b.prefix));
  }, [teams, state?.selectedTier, selectedTeamIds]);

  if (stateLoading || !state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-csc-darker via-csc-dark to-csc-darker flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-csc-darker via-csc-dark to-csc-darker overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-csc-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-csc-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 p-8 min-h-screen flex flex-col">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              textShadow: ['0 0 20px rgba(0,212,255,0.5)', '0 0 40px rgba(0,212,255,0.8)', '0 0 20px rgba(0,212,255,0.5)']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h1 className="text-6xl font-black text-white tracking-tight mb-3">
              {state.broadcastTitle}
            </h1>
          </motion.div>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-csc-accent" />
            <span className="text-csc-accent font-black uppercase tracking-widest text-xl">
              Week {state.currentWeek}
            </span>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-csc-accent" />
          </div>
        </motion.header>

        <div className={`flex-1 grid gap-6 max-w-7xl mx-auto w-full ${
          state.participants.length > 2 ? 'grid-cols-3' : 'grid-cols-2'
        }`}>
          {state.participants.length > 2 ? (
            <>
              <BroadcastParticipantCard
                key={state.participants[0].id}
                participant={state.participants[0]}
                side="left"
              />
              <BroadcastParticipantCard
                key={state.participants[2].id}
                participant={state.participants[2]}
                side="left"
              />
              <BroadcastParticipantCard
                key={state.participants[1].id}
                participant={state.participants[1]}
                side="right"
              />
            </>
          ) : (
            state.participants.slice(0, 2).map((participant, index) => (
              <BroadcastParticipantCard
                key={participant.id}
                participant={participant}
                side={index === 0 ? 'left' : 'right'}
              />
            ))
          )}
        </div>

        {state.selectedTier && availableFranchises.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col items-center"
          >
            <div className="text-sm text-white/40 uppercase tracking-widest font-bold mb-3">
              Available {state.selectedTier} Teams
            </div>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
              <AnimatePresence mode="popLayout">
                {availableFranchises.map(franchise => (
                  <motion.div
                    key={franchise.prefix}
                    layout
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
                    className="relative group"
                  >
                    {franchise.logo ? (
                      <img
                        src={franchise.logo}
                        alt={franchise.prefix}
                        className="w-12 h-12 rounded-lg object-contain bg-white/5 border border-white/10 p-1 transition-all group-hover:border-csc-accent/50 group-hover:bg-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                        {franchise.prefix}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 text-center"
        >
          <Link to="/host" className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-csc-green animate-pulse" />
            <span className="text-sm text-white/60 uppercase tracking-widest">Live</span>
          </Link>
        </motion.footer>
      </div>
    </div>
  );
}

// Playoff mode broadcast view
function PlayoffBroadcastView() {
  const { state, stateLoading } = useSession();

  if (stateLoading || !state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-csc-darker via-csc-dark to-csc-darker flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  if (!state.playoffBracket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-csc-darker via-csc-dark to-csc-darker flex items-center justify-center">
        <div className="text-center">
          <Trophy size={64} className="text-csc-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Playoff Mode Active</h2>
          <p className="text-white/60">Waiting for bracket to be set up...</p>
          <Link to="/host" className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <span className="text-sm text-white/60 uppercase tracking-widest">Go to Host Panel</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-csc-darker via-csc-dark to-csc-darker overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-csc-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-csc-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-3"
        >
          <div className="flex items-center justify-center gap-3 mb-1">
            <Trophy size={32} className="text-csc-gold" />
            <motion.h1
              animate={{ 
                textShadow: ['0 0 20px rgba(212,175,55,0.5)', '0 0 40px rgba(212,175,55,0.8)', '0 0 20px rgba(212,175,55,0.5)']
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-3xl font-black text-white tracking-tight"
            >
              {state.broadcastTitle}
            </motion.h1>
            <Trophy size={32} className="text-csc-gold" />
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="h-0.5 w-20 bg-gradient-to-r from-transparent to-csc-gold rounded-full" />
            <span className="text-csc-gold font-black uppercase tracking-widest text-sm">
              {state.playoffBracket.tier} Playoffs
            </span>
            <div className="h-0.5 w-20 bg-gradient-to-l from-transparent to-csc-gold rounded-full" />
          </div>
        </motion.header>

        {/* Participant cards */}
        <div className="grid grid-cols-3 gap-3 mb-3 max-w-4xl mx-auto w-full">
          {state.participants.map(participant => (
            <PlayoffParticipantCard
              key={participant.id}
              participant={participant}
              predictions={state.playoffPredictions}
              bracket={state.playoffBracket!}
            />
          ))}
        </div>

        {/* Bracket */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 bg-csc-dark/40 backdrop-blur-sm rounded-xl border border-white/20 p-3 overflow-auto"
        >
          <PlayoffBracketView
            bracket={state.playoffBracket}
            predictions={state.playoffPredictions}
            participants={state.participants}
          />
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-2 text-center"
        >
          <Link to="/host" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-csc-gold animate-pulse" />
            <span className="text-xs text-white/70 uppercase tracking-widest font-bold">Live</span>
          </Link>
        </motion.footer>
      </div>
    </div>
  );
}

// Main export that switches between regular and playoff mode
export function BroadcastViewWrapper() {
  const { state, stateLoading } = useSession();

  if (stateLoading || !state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-csc-darker via-csc-dark to-csc-darker flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  if (state.playoffMode) {
    return <PlayoffBroadcastView />;
  }

  return <BroadcastView />;
}
