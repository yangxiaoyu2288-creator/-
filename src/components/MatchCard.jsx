import React from 'react';
import { Clock, MapPin, Trophy, Eye, Calendar } from 'lucide-react';
import { statusLabels } from '../data/mockData';

const MatchCard = ({ match, onClick, isSelected }) => {
  const isLPL = match.league === 'lpl';
  const primaryColor = isLPL ? 'text-lpl' : 'text-ivl';
  const bgColor = isLPL ? 'bg-lpl/10' : 'bg-ivl/10';
  const borderColor = isLPL ? 'border-lpl/30' : 'border-ivl/30';
  const glowClass = isLPL ? 'hover:shadow-lpl-glow' : 'hover:shadow-ivl-glow';

  return (
    <div
      onClick={() => onClick(match)}
      className={`p-4 rounded-lg border ${borderColor} ${bgColor} ${glowClass} cursor-pointer transition-all duration-200 hover:scale-105 ${
        isSelected ? 'ring-2 ring-white' : ''
      }`}
    >
      {/* 联赛标签和时间 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 text-xs font-bold rounded ${isLPL ? 'bg-lpl/20 text-lpl' : 'bg-ivl/20 text-ivl'}`}>
            {match.league.toUpperCase()}
          </span>
          <span className="text-xs text-midnight-muted">{match.stage}</span>
        </div>
        <div className="flex items-center space-x-1 text-midnight-muted text-sm">
          <Clock className="w-3 h-3" />
          <span>{match.time}</span>
        </div>
      </div>

      {/* 对阵双方 */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-center">
          <div className={`text-2xl font-bold ${primaryColor}`}>{match.homeTeam.name}</div>
          <div className="text-xs text-midnight-muted mt-1">{match.homeTeam.fullName}</div>
        </div>

        <div className="flex items-center space-x-2">
          {match.status === 'completed' ? (
            <span className="text-3xl font-bold">{match.homeScore} : {match.awayScore}</span>
          ) : (
            <span className="text-3xl font-bold text-midnight-muted">VS</span>
          )}
        </div>

        <div className="flex-1 text-center">
          <div className={`text-2xl font-bold ${primaryColor}`}>{match.awayTeam.name}</div>
          <div className="text-xs text-midnight-muted mt-1">{match.awayTeam.fullName}</div>
        </div>
      </div>

      {/* 场地和状态 */}
      <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-midnight-muted">
        <div className="flex items-center space-x-1">
          <MapPin className="w-3 h-3" />
          <span>{match.venue}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Trophy className="w-3 h-3" />
          <span>{statusLabels[match.status]}</span>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;