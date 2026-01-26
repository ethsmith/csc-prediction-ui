import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Team } from '../lib/graphql';
import { Button, Card } from './ui';
import { X, Target } from 'lucide-react';

interface OwnTeamSelectorProps {
  team: Team;
  onSelect: (predictedRecord: '2-0' | '1-1' | '0-2', reasoning: string) => void;
  onClose: () => void;
}

export function OwnTeamSelector({ team, onSelect, onClose }: OwnTeamSelectorProps) {
  const [predictedRecord, setPredictedRecord] = useState<'2-0' | '1-1' | '0-2'>('2-0');
  const [reasoning, setReasoning] = useState('');

  const handleConfirm = () => {
    onSelect(predictedRecord, reasoning);
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
        className="bg-csc-dark border border-csc-gold/30 rounded-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-csc-gold/10 to-transparent">
          <div className="flex items-center gap-2">
            <Target className="text-csc-gold" size={24} />
            <h2 className="text-2xl font-bold text-white">Own Team Prediction</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Card className="p-4 border-csc-gold/30">
            <div className="flex items-center gap-4">
              {team.franchise.logo ? (
                <img
                  src={team.franchise.logo}
                  alt={team.franchise.name}
                  className="w-16 h-16 rounded-lg object-contain bg-white/10"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-xl font-bold">
                  {team.franchise.prefix}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white">{team.name}</h3>
                <p className="text-white/60">{team.franchise.name}</p>
                <p className="text-sm text-csc-gold">Your Team</p>
              </div>
            </div>
          </Card>

          <div>
            <label className="text-sm font-medium text-white/70 mb-3 block">
              Predicted Record for the Week
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['2-0', '1-1', '0-2'] as const).map(record => (
                <button
                  key={record}
                  onClick={() => setPredictedRecord(record)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    predictedRecord === record
                      ? 'border-csc-gold bg-csc-gold/20'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="text-2xl font-bold text-white">{record}</div>
                  <div className="text-xs text-white/60 mt-1">
                    {record === '2-0' ? 'Sweep' : record === '1-1' ? 'Split' : 'Swept'}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-white/50 mt-2 text-center">
              Correct prediction = 1 point
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">
              Reasoning (Optional)
            </label>
            <textarea
              value={reasoning}
              onChange={e => setReasoning(e.target.value)}
              placeholder="Why do you think your team will have this record?"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-csc-gold resize-none h-24"
            />
          </div>

          <Button onClick={handleConfirm} className="w-full bg-csc-gold hover:bg-csc-gold/80 text-csc-dark" size="lg">
            Lock In Prediction
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
