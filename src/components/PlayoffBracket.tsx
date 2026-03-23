import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayoffBracket, PlayoffMatchup, PlayoffPrediction, Participant } from '../lib/store';
import { Trophy, ChevronRight } from 'lucide-react';

interface PlayoffMatchupCardProps {
  matchup: PlayoffMatchup;
  predictions: PlayoffPrediction[];
  participants: Participant[];
  showPredictions?: boolean;
}

function PlayoffMatchupCard({ matchup, predictions, participants, showPredictions = true }: PlayoffMatchupCardProps) {
  const team1Predictions = predictions.filter(p => p.predictedWinner === matchup.team1?.teamId);
  const team2Predictions = predictions.filter(p => p.predictedWinner === matchup.team2?.teamId);

  const getParticipantName = (participantId: string) => {
    return participants.find(p => p.id === participantId)?.name || participantId;
  };

  const isComplete = !!matchup.winner;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-csc-dark/80 backdrop-blur-sm rounded-xl border-2 border-white/20 overflow-hidden min-w-[320px]"
    >
      {matchup.scheduledDate && (
        <div className="text-sm text-white/50 text-center py-2 bg-white/5 border-b border-white/10 font-medium">
          {matchup.scheduledDate}
        </div>
      )}
      
      {/* Team 1 */}
      <div
        className={`flex items-center gap-3 p-3 border-b border-white/10 transition-colors ${
          matchup.winner === matchup.team1?.teamId
            ? 'bg-csc-green/20 border-l-4 border-l-csc-green'
            : matchup.winner && matchup.winner !== matchup.team1?.teamId
            ? 'opacity-50'
            : ''
        }`}
      >
        {matchup.team1 ? (
          <>
            <div className="w-8 h-8 flex items-center justify-center text-base font-black text-csc-gold bg-csc-gold/20 rounded-lg">
              {matchup.team1.seed}
            </div>
            {matchup.team1.teamLogo ? (
              <img src={matchup.team1.teamLogo} alt="" className="w-10 h-10 rounded-lg object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold">
                {matchup.team1.franchisePrefix}
              </div>
            )}
            <span className="text-lg font-bold text-white flex-1">
              [{matchup.team1.franchisePrefix}] {matchup.team1.teamName}
            </span>
            {matchup.winner === matchup.team1?.teamId && (
              <Trophy size={24} className="text-csc-gold" />
            )}
          </>
        ) : (
          <span className="text-lg text-white/30 italic">TBD</span>
        )}
      </div>

      {/* Team 2 */}
      <div
        className={`flex items-center gap-3 p-3 transition-colors ${
          matchup.winner === matchup.team2?.teamId
            ? 'bg-csc-green/20 border-l-4 border-l-csc-green'
            : matchup.winner && matchup.winner !== matchup.team2?.teamId
            ? 'opacity-50'
            : ''
        }`}
      >
        {matchup.team2 ? (
          <>
            <div className="w-8 h-8 flex items-center justify-center text-base font-black text-csc-gold bg-csc-gold/20 rounded-lg">
              {matchup.team2.seed}
            </div>
            {matchup.team2.teamLogo ? (
              <img src={matchup.team2.teamLogo} alt="" className="w-10 h-10 rounded-lg object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold">
                {matchup.team2.franchisePrefix}
              </div>
            )}
            <span className="text-lg font-bold text-white flex-1">
              [{matchup.team2.franchisePrefix}] {matchup.team2.teamName}
            </span>
            {matchup.winner === matchup.team2?.teamId && (
              <Trophy size={24} className="text-csc-gold" />
            )}
          </>
        ) : (
          <span className="text-lg text-white/30 italic">TBD</span>
        )}
      </div>

      {/* Score display */}
      {isComplete && matchup.score && (
        <div className="text-center py-2 bg-csc-gold/10 text-csc-gold text-lg font-black">
          {matchup.score}
        </div>
      )}

      {/* Predictions */}
      {showPredictions && predictions.length > 0 && (
        <div className="p-3 bg-white/5 border-t border-white/10">
          <div className="text-sm text-white/50 mb-2 font-medium">Predictions:</div>
          <div className="flex flex-wrap gap-2">
            {predictions.map(pred => {
              const isRevealed = pred.revealed;
              const predictedTeam = pred.predictedWinner === matchup.team1?.teamId 
                ? matchup.team1 
                : matchup.team2;
              
              return (
                <AnimatePresence key={`${pred.participantId}-${pred.matchupId}`} mode="wait">
                  {isRevealed ? (
                    <motion.div
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      className={`text-sm px-3 py-1.5 rounded-full font-semibold ${
                        pred.correct === true
                          ? 'bg-csc-green/30 text-csc-green border-2 border-csc-green/50'
                          : pred.correct === false
                          ? 'bg-red-500/30 text-red-400 border-2 border-red-500/50'
                          : 'bg-white/10 text-white/80 border-2 border-white/20'
                      }`}
                    >
                      {getParticipantName(pred.participantId)}: {predictedTeam?.franchisePrefix} ({pred.predictedScore})
                      {pred.scoreCorrect && ' ⭐'}
                    </motion.div>
                  ) : (
                    <motion.div
                      className="text-sm px-3 py-1.5 rounded-full font-semibold bg-csc-blue/30 text-csc-accent border-2 border-csc-accent/30"
                    >
                      {getParticipantName(pred.participantId)}: ???
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface PlayoffBracketViewProps {
  bracket: PlayoffBracket;
  predictions: PlayoffPrediction[];
  participants: Participant[];
}

export function PlayoffBracketView({ bracket, predictions, participants }: PlayoffBracketViewProps) {
  // Group matchups by round
  const rounds = useMemo(() => {
    const roundMap = new Map<number, PlayoffMatchup[]>();
    for (const matchup of bracket.matchups) {
      const existing = roundMap.get(matchup.round) || [];
      existing.push(matchup);
      roundMap.set(matchup.round, existing);
    }
    // Sort matchups within each round by position
    for (const [round, matchups] of roundMap) {
      roundMap.set(round, matchups.sort((a, b) => a.position - b.position));
    }
    return roundMap;
  }, [bracket.matchups]);

  const maxRound = Math.max(...Array.from(rounds.keys()));
  
  const getMatchupPredictions = (matchupId: string) => {
    return predictions.filter(p => p.matchupId === matchupId);
  };

  // Split first round matchups into left and right halves
  const firstRoundMatchups = rounds.get(1) || [];
  const halfCount = Math.ceil(firstRoundMatchups.length / 2);
  const leftFirstRound = firstRoundMatchups.slice(0, halfCount);
  const rightFirstRound = firstRoundMatchups.slice(halfCount);

  // For subsequent rounds, split based on which first-round matchups they connect to
  const getLeftRounds = () => {
    const leftRounds: Map<number, PlayoffMatchup[]> = new Map();
    leftRounds.set(1, leftFirstRound);
    
    for (let r = 2; r <= maxRound; r++) {
      const roundMatchups = rounds.get(r) || [];
      const prevCount = leftRounds.get(r - 1)?.length || 0;
      const thisRoundCount = Math.ceil(prevCount / 2);
      leftRounds.set(r, roundMatchups.slice(0, thisRoundCount));
    }
    return leftRounds;
  };

  const getRightRounds = () => {
    const rightRounds: Map<number, PlayoffMatchup[]> = new Map();
    rightRounds.set(1, rightFirstRound);
    
    for (let r = 2; r <= maxRound; r++) {
      const roundMatchups = rounds.get(r) || [];
      const leftCount = Math.ceil((rounds.get(r - 1)?.length || 0) / 2 / 2);
      rightRounds.set(r, roundMatchups.slice(leftCount));
    }
    return rightRounds;
  };

  const leftRounds = getLeftRounds();
  const rightRounds = getRightRounds();

  // Check if we have a finals matchup (single matchup in last round)
  const finalsMatchup = (rounds.get(maxRound) || [])[0];
  const hasFinalsInCenter = finalsMatchup && (rounds.get(maxRound)?.length === 1);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Finals in center at top if exists */}
      {hasFinalsInCenter && (
        <div className="flex justify-center mb-6">
          <div className="text-center">
            <h3 className="text-2xl font-black text-csc-gold uppercase tracking-widest mb-4">
              🏆 Finals 🏆
            </h3>
            <PlayoffMatchupCard
              matchup={finalsMatchup}
              predictions={getMatchupPredictions(finalsMatchup.id)}
              participants={participants}
              showPredictions={true}
            />
          </div>
        </div>
      )}

      {/* Left and Right bracket sides */}
      <div className="flex-1 flex justify-between gap-8">
        {/* Left Side - rounds progress left to right */}
        <div className="flex gap-4">
          {Array.from({ length: hasFinalsInCenter ? maxRound - 1 : maxRound }, (_, i) => i + 1).map(round => {
            const matchups = leftRounds.get(round) || [];
            if (matchups.length === 0) return null;
            
            return (
              <div key={`left-${round}`} className="flex flex-col justify-around gap-2">
                {matchups.map(matchup => (
                  <CompactMatchupCard
                    key={matchup.id}
                    matchup={matchup}
                    predictions={getMatchupPredictions(matchup.id)}
                    participants={participants}
                    side="left"
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Right Side - rounds progress right to left (reversed) */}
        <div className="flex flex-row-reverse gap-4">
          {Array.from({ length: hasFinalsInCenter ? maxRound - 1 : maxRound }, (_, i) => i + 1).map(round => {
            const matchups = rightRounds.get(round) || [];
            if (matchups.length === 0) return null;
            
            return (
              <div key={`right-${round}`} className="flex flex-col justify-around gap-2">
                {matchups.map(matchup => (
                  <CompactMatchupCard
                    key={matchup.id}
                    matchup={matchup}
                    predictions={getMatchupPredictions(matchup.id)}
                    participants={participants}
                    side="right"
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Compact matchup card for bracket view - smaller and fits better
function CompactMatchupCard({ 
  matchup, 
  predictions, 
  participants,
  side 
}: { 
  matchup: PlayoffMatchup; 
  predictions: PlayoffPrediction[];
  participants: Participant[];
  side: 'left' | 'right';
}) {
  const getParticipantName = (participantId: string) => {
    return participants.find(p => p.id === participantId)?.name || participantId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-csc-dark/90 backdrop-blur-sm rounded-lg border-2 border-white/20 overflow-hidden"
    >
      {/* Team 1 */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 border-b border-white/10 text-xs ${
          matchup.winner === matchup.team1?.teamId
            ? 'bg-csc-green/20 border-l-4 border-l-csc-green'
            : matchup.winner && matchup.winner !== matchup.team1?.teamId
            ? 'opacity-40'
            : ''
        }`}
      >
        {matchup.team1 ? (
          <>
            <span className="w-5 h-5 flex items-center justify-center text-xs font-black text-csc-gold bg-csc-gold/20 rounded">
              {matchup.team1.seed}
            </span>
            {matchup.team1.teamLogo && (
              <img src={matchup.team1.teamLogo} alt="" className="w-5 h-5 rounded object-contain" />
            )}
            <span className="text-xs font-bold text-white flex-1 truncate">
              [{matchup.team1.franchisePrefix}] {matchup.team1.teamName}
            </span>
            {matchup.winner === matchup.team1?.teamId && (
              <Trophy size={12} className="text-csc-gold" />
            )}
          </>
        ) : (
          <span className="text-xs text-white/30 italic">TBD</span>
        )}
      </div>

      {/* Team 2 */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 text-xs ${
          matchup.winner === matchup.team2?.teamId
            ? 'bg-csc-green/20 border-l-4 border-l-csc-green'
            : matchup.winner && matchup.winner !== matchup.team2?.teamId
            ? 'opacity-40'
            : ''
        }`}
      >
        {matchup.team2 ? (
          <>
            <span className="w-5 h-5 flex items-center justify-center text-xs font-black text-csc-gold bg-csc-gold/20 rounded">
              {matchup.team2.seed}
            </span>
            {matchup.team2.teamLogo && (
              <img src={matchup.team2.teamLogo} alt="" className="w-5 h-5 rounded object-contain" />
            )}
            <span className="text-xs font-bold text-white flex-1 truncate">
              [{matchup.team2.franchisePrefix}] {matchup.team2.teamName}
            </span>
            {matchup.winner === matchup.team2?.teamId && (
              <Trophy size={12} className="text-csc-gold" />
            )}
          </>
        ) : (
          <span className="text-xs text-white/30 italic">TBD</span>
        )}
      </div>

      {/* Score if complete */}
      {matchup.winner && matchup.score && (
        <div className="text-center py-0.5 bg-csc-gold/10 text-csc-gold text-xs font-black">
          {matchup.score}
        </div>
      )}

      {/* Predictions */}
      {predictions.length > 0 && (
        <div className="px-1.5 py-1 bg-white/5 border-t border-white/10">
          <div className="flex flex-wrap gap-1">
            {predictions.map(pred => {
              const predictedTeam = pred.predictedWinner === matchup.team1?.teamId 
                ? matchup.team1 
                : matchup.team2;
              const name = getParticipantName(pred.participantId);
              
              return (
                <div
                  key={`${pred.participantId}-${pred.matchupId}`}
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    pred.revealed
                      ? pred.scoreCorrect === true
                        ? 'bg-csc-green/30 text-csc-green'
                        : (pred.correct === false || pred.correct === true)
                        ? 'bg-red-500/30 text-red-400'
                        : 'bg-white/10 text-white/80'
                      : 'bg-csc-blue/20 text-csc-accent'
                  }`}
                >
                  {pred.revealed 
                    ? `${name}: ${predictedTeam?.franchisePrefix} (${pred.predictedScore})${pred.scoreCorrect ? ' ✓' : ' ✗'}`
                    : `${name}: ?`
                  }
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Participant playoff predictions summary card
interface PlayoffParticipantCardProps {
  participant: Participant;
  predictions: PlayoffPrediction[];
  bracket: PlayoffBracket;
}

export function PlayoffParticipantCard({ participant, predictions, bracket }: PlayoffParticipantCardProps) {
  const participantPredictions = predictions.filter(p => p.participantId === participant.id);
  const correctPredictions = participantPredictions.filter(p => p.correct === true).length;
  const scoreBonuses = participantPredictions.filter(p => p.scoreCorrect === true).length;
  const revealedCount = participantPredictions.filter(p => p.revealed).length;
  const totalMatchups = bracket.matchups.length;

  const roleGradients = {
    host: 'from-csc-accent via-blue-500 to-csc-accent',
    cohost: 'from-purple-500 via-pink-500 to-purple-500',
    guest: 'from-csc-gold via-orange-500 to-csc-gold',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-csc-dark/80 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden"
    >
      <div className={`h-1 bg-gradient-to-r ${roleGradients[participant.role]}`} />
      
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xl font-black text-white">{participant.name}</h3>
            <p className="text-xs text-white/60 uppercase tracking-widest font-bold">{participant.role}</p>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-csc-gold/20 to-csc-gold/10 rounded-xl px-3 py-2 border border-csc-gold/40">
            <Trophy size={24} className="text-csc-gold" />
            <div className="text-right">
              <div className="text-2xl font-black text-white">
                {participant.score}
              </div>
              <div className="text-xs text-csc-gold uppercase font-bold">Points</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="text-lg font-black text-white">{participantPredictions.length}/{totalMatchups}</div>
            <div className="text-xs text-white/60 font-medium">Predictions</div>
          </div>
          <div className="bg-csc-green/10 rounded-lg p-2 border border-csc-green/30">
            <div className="text-lg font-black text-csc-green">{scoreBonuses}</div>
            <div className="text-xs text-white/60 font-medium">Correct</div>
          </div>
        </div>

        {revealedCount < participantPredictions.length && (
          <div className="mt-2 text-center text-xs text-white/50 font-medium">
            {participantPredictions.length - revealedCount} hidden
          </div>
        )}
      </div>
    </motion.div>
  );
}
