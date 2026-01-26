import { motion, AnimatePresence } from 'framer-motion';
import type { Prediction, OwnTeamPrediction } from '../lib/store';
import { TrendingUp, TrendingDown, Target, X } from 'lucide-react';

interface PredictionSlotProps {
  prediction?: Prediction | OwnTeamPrediction;
  slotType: 'regular' | 'ownTeam';
  slotNumber: number;
  revealed: boolean;
  onRemove?: () => void;
  showControls?: boolean;
}

function isPrediction(p: Prediction | OwnTeamPrediction): p is Prediction {
  return 'type' in p;
}

export function PredictionSlot({
  prediction,
  slotType,
  slotNumber,
  revealed,
  onRemove,
  showControls = false,
}: PredictionSlotProps) {
  const isEmpty = !prediction;

  return (
    <motion.div
      layout
      className={`relative rounded-xl border-2 overflow-hidden ${
        slotType === 'ownTeam'
          ? 'border-csc-gold/50 bg-csc-gold/5'
          : 'border-csc-accent/30 bg-white/5'
      }`}
      style={{ minHeight: '120px' }}
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
              <div className="text-4xl font-bold mb-1">
                {slotType === 'ownTeam' ? '🏠' : slotNumber}
              </div>
              <div className="text-xs uppercase tracking-wider">
                {slotType === 'ownTeam' ? 'Own Team' : 'Empty Slot'}
              </div>
            </div>
          </motion.div>
        ) : !revealed ? (
          <motion.div
            key="hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-csc-blue to-csc-dark p-3"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {prediction.teamLogo ? (
                <img
                  src={prediction.teamLogo}
                  alt={prediction.teamName}
                  className="w-16 h-16 rounded-lg object-contain"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-2xl font-bold">
                  {prediction.franchisePrefix}
                </div>
              )}
            </motion.div>
            <div className="text-xs text-white/80 font-medium mt-2 text-center truncate max-w-full px-1">
              {prediction.teamName}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 p-4 flex flex-col"
          >
            {showControls && onRemove && (
              <button
                onClick={onRemove}
                className="absolute top-2 right-2 p-1 rounded-full bg-csc-red/20 hover:bg-csc-red/40 transition-colors"
              >
                <X size={14} />
              </button>
            )}
            
            <div className="flex items-center gap-3 mb-2">
              {prediction.teamLogo ? (
                <img
                  src={prediction.teamLogo}
                  alt={prediction.teamName}
                  className="w-12 h-12 rounded-lg object-contain bg-white/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-lg font-bold">
                  {prediction.franchisePrefix}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate">
                  {prediction.teamName}
                </div>
                <div className="text-xs text-white/60">
                  {prediction.franchisePrefix}
                </div>
              </div>
            </div>

            <div className="mt-auto">
              {isPrediction(prediction) ? (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                  prediction.type === 'favorite'
                    ? 'bg-csc-green/20 text-csc-green'
                    : 'bg-csc-gold/20 text-csc-gold'
                }`}>
                  {prediction.type === 'favorite' ? (
                    <>
                      <TrendingUp size={14} />
                      Favorite (2-0)
                    </>
                  ) : (
                    <>
                      <TrendingDown size={14} />
                      Sleeper (1-1)
                    </>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-csc-accent/20 text-csc-accent">
                  <Target size={14} />
                  Predicted: {prediction.predictedRecord}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
