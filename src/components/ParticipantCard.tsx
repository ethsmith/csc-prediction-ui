import { motion } from 'framer-motion';
import type { Participant } from '../lib/store';
import { PredictionSlot } from './PredictionSlot';
import { Trophy, User, Mic, Users } from 'lucide-react';

interface ParticipantCardProps {
  participant: Participant;
  isCurrentTurn?: boolean;
  showControls?: boolean;
  onRemovePrediction?: (predictionId: string) => void;
  onRemoveOwnTeamPrediction?: () => void;
  onToggleReveal?: (participantId: string, predictionId: string, isOwnTeam: boolean) => void;
}

export function ParticipantCard({
  participant,
  isCurrentTurn = false,
  showControls = false,
  onRemovePrediction,
  onRemoveOwnTeamPrediction,
  onToggleReveal,
}: ParticipantCardProps) {
  const roleIcon = {
    host: <Mic size={18} />,
    cohost: <User size={18} />,
    guest: <Users size={18} />,
  };

  const roleColors = {
    host: 'from-csc-accent to-blue-600',
    cohost: 'from-purple-500 to-pink-500',
    guest: 'from-csc-gold to-orange-500',
  };

  return (
    <motion.div
      layout
      className={`relative rounded-2xl overflow-hidden ${
        isCurrentTurn ? 'ring-2 ring-csc-accent ring-offset-2 ring-offset-csc-dark' : ''
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${roleColors[participant.role]} opacity-10`} />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${roleColors[participant.role]}`}>
              {roleIcon[participant.role]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{participant.name}</h3>
              <p className="text-sm text-white/60 capitalize">{participant.role}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <Trophy size={20} className="text-csc-gold" />
            <span className="text-2xl font-bold text-white">{participant.score}</span>
            <span className="text-sm text-white/60">pts</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: participant.slotCount }).map((_, index) => {
            const prediction = participant.predictions[index];
            const slotId = prediction?.id || `empty-${index}`;
            const isRevealed = prediction ? prediction.revealed : false;
            
            return (
              <PredictionSlot
                key={slotId}
                prediction={prediction}
                slotType="regular"
                slotNumber={index + 1}
                revealed={isRevealed}
                showControls={showControls}
                onRemove={
                  showControls && prediction && onRemovePrediction
                    ? () => onRemovePrediction(prediction.id)
                    : undefined
                }
                onToggleReveal={
                  showControls && prediction && onToggleReveal
                    ? () => onToggleReveal(participant.id, prediction.id, false)
                    : undefined
                }
              />
            );
          })}
          
          <PredictionSlot
            prediction={participant.ownTeamPrediction}
            slotType="ownTeam"
            slotNumber={0}
            revealed={
              participant.ownTeamPrediction
                ? participant.ownTeamPrediction.revealed
                : false
            }
            showControls={showControls}
            onRemove={
              showControls && participant.ownTeamPrediction && onRemoveOwnTeamPrediction
                ? onRemoveOwnTeamPrediction
                : undefined
            }
            onToggleReveal={
              showControls && participant.ownTeamPrediction && onToggleReveal
                ? () => onToggleReveal(participant.id, participant.ownTeamPrediction!.id, true)
                : undefined
            }
          />
        </div>
      </div>
    </motion.div>
  );
}
