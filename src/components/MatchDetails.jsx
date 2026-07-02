import React from 'react';
import { X, Clock, MapPin, Trophy, Calendar, Share2, Bell, Users, Star, Info } from 'lucide-react';
import { statusLabels } from '../data/mockData';

const MatchDetails = ({ match, onClose, favoriteTeams, toggleFavoriteTeam }) => {

  if (!match) return null;

  const isLPL = match.league === 'lpl';
  const accentColor = isLPL ? 'text-lpl' : 'text-ivl';
  const bgAccent = isLPL ? 'bg-lpl-bg' : 'bg-ivl-bg';
  const borderAccent = isLPL ? 'border-lpl/30' : 'border-ivl/30';
  const badgeBg = isLPL ? 'bg-lpl/10 text-lpl' : 'bg-ivl/10 text-ivl';

  const isHomeFav = favoriteTeams?.includes(match.homeTeam.id);
  const isAwayFav = favoriteTeams?.includes(match.awayTeam.id);

  return (
    <div className="w-full h-full min-h-0 flex flex-col animate-slide-in bg-white">
      {/* 头部 */}
      <div className={`${bgAccent} border-b ${borderAccent} p-6 flex items-start justify-between`}>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${badgeBg}`}>
              {match.league.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">{match.stage}</span>
            {match.status === 'live' && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-600 animate-pulse">
                直播中
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className={`text-3xl font-bold ${accentColor}`}>{match.homeTeam.name}</div>
                <button onClick={() => toggleFavoriteTeam?.(match.homeTeam.id)}>
                  <Star className={`w-5 h-5 ${isHomeFav ? 'text-amber-400 fill-amber-400' : 'text-gray-400 hover:text-amber-400'}`} />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">{match.homeTeam.fullName}</div>
            </div>

            <div className="flex items-center px-4">
              {match.status === 'completed' ? (
                <span className="text-4xl font-bold text-gray-900">{match.homeScore} : {match.awayScore}</span>
              ) : (
                <span className="text-4xl font-bold text-gray-400">VS</span>
              )}
            </div>

            <div className="flex-1 text-right">
              <div className="flex items-center justify-end space-x-2">
                <button onClick={() => toggleFavoriteTeam?.(match.awayTeam.id)}>
                  <Star className={`w-5 h-5 ${isAwayFav ? 'text-amber-400 fill-amber-400' : 'text-gray-400 hover:text-amber-400'}`} />
                </button>
                <div className={`text-3xl font-bold ${accentColor}`}>{match.awayTeam.name}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{match.awayTeam.fullName}</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="ml-4 p-2 hover:bg-white/60 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 操作按钮 */}
      <div className="p-4 border-b border-gray-200 grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center space-x-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
          <Bell className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-sm text-gray-700 whitespace-nowrap">赛前提醒</span>
        </button>
        <button
          onClick={() => {}}
          className="flex items-center justify-center space-x-2 px-3 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
        >
          <Share2 className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-sm text-gray-700 whitespace-nowrap">分享</span>
        </button>
      </div>

      {/* 比赛信息 */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-5">
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
            <Info className="w-4 h-4" />
            <span>比赛信息</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">日期</span>
              <span className="text-gray-900 font-medium">{match.date}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">时间</span>
              <span className="text-gray-900 font-medium">{match.time}</span>
            </div>
            {match.venue && (
              <div className="flex items-center space-x-2 text-sm col-span-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">场地</span>
                <span className="text-gray-900 font-medium">{match.venue}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm">
              <Trophy className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">状态</span>
              <span className={`font-medium ${
                match.status === 'live' ? 'text-red-600' :
                match.status === 'completed' ? 'text-gray-500' : 'text-lpl'
              }`}>{statusLabels[match.status]}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>参赛战队</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-8 rounded-full ${isLPL ? 'bg-lpl' : 'bg-ivl'}`} />
                <div>
                  <div className={`text-lg font-bold ${accentColor}`}>{match.homeTeam.name}</div>
                  <div className="text-xs text-gray-500">{match.homeTeam.fullName}</div>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">主场</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-8 rounded-full ${isLPL ? 'bg-lpl/40' : 'bg-ivl/40'}`} />
                <div>
                  <div className={`text-lg font-bold ${accentColor}`}>{match.awayTeam.name}</div>
                  <div className="text-xs text-gray-500">{match.awayTeam.fullName}</div>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">客场</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
