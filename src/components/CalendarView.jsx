import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { getMatchesByDate } from '../data/mockData';

const CalendarView = ({
  currentDate,
  onDateChange,
  calendarDays,
  matches,
  filters,
  selectedDate,
  onDateClick,
  onMatchClick,
  selectedMatch,
}) => {
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const prevMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDayMatches = (date) => {
    if (!date) return [];
    if (filters.leagues.length === 0) return [];
    const dayMatches = getMatchesByDate(matches, date);
    return dayMatches.filter(match => {
      if (!filters.leagues.includes(match.league)) return false;
      if (filters.teams.length > 0 && !filters.teams.includes(match.homeTeam.id) && !filters.teams.includes(match.awayTeam.id)) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return match.homeTeam.name.toLowerCase().includes(searchLower) ||
               match.awayTeam.name.toLowerCase().includes(searchLower);
      }
      return true;
    });
  };

  const getDayType = (date) => {
    if (!date || !isSameMonth(date, currentDate)) return 'empty';
    const dayMatches = getDayMatches(date);
    if (dayMatches.length === 0) return 'empty';
    const lplMatches = dayMatches.filter(m => m.league === 'lpl');
    const ivlMatches = dayMatches.filter(m => m.league === 'ivl');
    if (lplMatches.length > 0 && ivlMatches.length > 0) return 'mixed';
    if (lplMatches.length > 0) return 'lpl';
    if (ivlMatches.length > 0) return 'ivl';
    return 'empty';
  };

  const noLeagueSelected = filters.leagues.length === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* 日历头部 */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {noLeagueSelected && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-500">
          请先在上方选择联赛以查看赛程
        </div>
      )}

      {/* 星期标题 */}
      <div className="grid grid-cols-7 bg-gray-50">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center py-3 text-sm font-medium text-gray-500 border-b border-gray-200">
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          const dayType = getDayType(date);
          const isSelected = selectedDate && date && isSameDay(date, selectedDate);
          const dayMatches = getDayMatches(date);
          const isCurrentMonth = date && isSameMonth(date, currentDate);

          const bgClasses = {
            empty: '',
            lpl: 'bg-lpl-bg',
            ivl: 'bg-ivl-bg',
            mixed: 'bg-gradient-to-br from-lpl-bg to-ivl-bg',
          };

          return (
            <div
              key={index}
              onClick={() => isCurrentMonth && date && dayMatches.length > 0 && onDateClick(date)}
              className={`min-h-24 border-b border-r border-gray-200 p-1.5 relative ${
                isCurrentMonth && dayMatches.length > 0 ? 'cursor-pointer' : ''
              } ${bgClasses[dayType]} ${isSelected ? 'ring-2 ring-inset ring-lpl' : ''}`}
            >
              {isCurrentMonth && (
                <>
                  <span className={`text-sm font-semibold block mb-1 px-0.5 ${
                    dayType !== 'empty' ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {format(date, 'd')}
                  </span>
                  {dayMatches.length > 0 && (
                    <div className="space-y-0.5">
                      {dayMatches.slice(0, 4).map((match, idx) => {
                        const isThisSelected = selectedMatch && selectedMatch.id === match.id;
                        return (
                          <button
                            key={match.id || idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onMatchClick(match);
                            }}
                            className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate transition-all ${
                              match.league === 'lpl'
                                ? isThisSelected
                                  ? 'bg-lpl text-white'
                                  : 'bg-lpl/12 text-lpl border border-lpl/20 hover:bg-lpl/20'
                                : isThisSelected
                                  ? 'bg-ivl text-white'
                                  : 'bg-ivl/12 text-ivl border border-ivl/20 hover:bg-ivl/20'
                            }`}
                          >
                            {match.homeTeam.name} vs {match.awayTeam.name}
                          </button>
                        );
                      })}
                      {dayMatches.length > 4 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{dayMatches.length - 4} 场
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
