import React, { useState } from 'react';
import { Filter, Search, X, ChevronDown, Check, Star } from 'lucide-react';

const getTeamLeague = (team) => team.league || team.region?.toLowerCase();

const FilterBar = ({ leagues, teams, filters, onFilterChange, favoriteTeams, toggleFavoriteTeam }) => {
  const [showLeagueDropdown, setShowLeagueDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  const selectableTeams = teams.filter(team => filters.leagues.includes(getTeamLeague(team)));
  const selectableTeamIds = new Set(selectableTeams.map(team => team.id));
  const favoriteSelectableTeams = favoriteTeams.filter(teamId => selectableTeamIds.has(teamId));
  const teamDisabled = filters.leagues.length === 0;

  const toggleLeague = (leagueId) => {
    const newLeagues = filters.leagues.includes(leagueId)
      ? filters.leagues.filter(id => id !== leagueId)
      : [...filters.leagues, leagueId];
    const validTeamIds = new Set(
      teams.filter(team => newLeagues.includes(getTeamLeague(team))).map(team => team.id)
    );
    onFilterChange({ ...filters, leagues: newLeagues, teams: filters.teams.filter(id => validTeamIds.has(id)) });
    if (newLeagues.length === 0) setShowTeamDropdown(false);
  };

  const toggleTeam = (teamId) => {
    const newTeams = filters.teams.includes(teamId)
      ? filters.teams.filter(id => id !== teamId)
      : [...filters.teams, teamId];
    onFilterChange({ ...filters, teams: newTeams });
  };

  const clearTeamFilter = () => {
    onFilterChange({ ...filters, teams: [] });
  };

  const showMyTeams = () => {
    onFilterChange({ ...filters, teams: [...favoriteSelectableTeams] });
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          {favoriteSelectableTeams.length > 0 && (
            <button
              onClick={showMyTeams}
              className="flex items-center space-x-1 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-600 text-sm rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Star className="w-3 h-3 fill-amber-400" />
              <span>我的主队</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowLeagueDropdown(!showLeagueDropdown)}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">联赛</span>
              {filters.leagues.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                  {filters.leagues.length}
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showLeagueDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 overflow-hidden">
                {leagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => toggleLeague(league.id)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: league.color }} />
                      <span className="text-sm text-gray-900">{league.name}</span>
                    </div>
                    {filters.leagues.includes(league.id) && <Check className="w-4 h-4 text-gray-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => !teamDisabled && setShowTeamDropdown(!showTeamDropdown)}
              disabled={teamDisabled}
              className={`flex items-center space-x-2 px-3 py-2 bg-white border rounded-lg transition-colors ${
                teamDisabled
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                  : filters.teams.length > 0
                    ? 'border-lpl/50 hover:border-lpl'
                    : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">{teamDisabled ? '先选择联赛' : '战队'}</span>
              {filters.teams.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-lpl/10 text-lpl rounded">
                  {filters.teams.length}
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showTeamDropdown && !teamDisabled && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80 max-h-96 overflow-y-auto">
                <div className="p-2 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <span className="text-xs text-gray-500">仅显示已选联赛战队（点星标设为主队）</span>
                  {filters.teams.length > 0 && (
                    <button onClick={clearTeamFilter} className="text-xs text-lpl hover:text-lpl-dim">
                      清除全部
                    </button>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  {selectableTeams.map((team) => (
                    <div
                      key={team.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                        filters.teams.includes(team.id) ? 'bg-lpl/5' : ''
                      }`}
                    >
                      <div
                        className="flex items-center space-x-2 flex-1 min-w-0"
                        onClick={() => toggleTeam(team.id)}
                      >
                        <span className="text-sm font-medium text-gray-900">{team.name}</span>
                        <span className="text-xs text-gray-500 truncate">{team.fullName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {filters.teams.includes(team.id) && <Check className="w-4 h-4 text-lpl" />}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavoriteTeam(team.id); }}
                          className="p-0.5"
                        >
                          <Star className={`w-4 h-4 transition-colors ${
                            favoriteTeams.includes(team.id)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-400 hover:text-amber-400'
                          }`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="搜索战队..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-lpl/50 transition-colors text-sm"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-900" />
              </button>
            )}
          </div>

          {filters.teams.length > 0 && (
            <div className="flex items-center space-x-2">
              {filters.teams.slice(0, 3).map(teamId => {
                const team = selectableTeams.find(t => t.id === teamId);
                if (!team) return null;
                return (
                  <span key={teamId} className="px-2 py-1 bg-lpl/10 text-lpl text-xs rounded border border-lpl/30">
                    {team.name}
                  </span>
                );
              })}
              {filters.teams.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                  +{filters.teams.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
