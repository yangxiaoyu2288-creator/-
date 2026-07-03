import React, { useState, useEffect } from 'react';
import { X, Calendar, Settings, Bell, ArrowLeft, Lock } from 'lucide-react';
import { LPL_TEAMS, IVL_TEAMS, LEAGUES, generateMockMatches, getMatchesByDate, getCalendarDays } from './data/mockData';
import CalendarView from './components/CalendarView';
import FilterBar from './components/FilterBar';
import MatchDetails from './components/MatchDetails';
import AdminPanel from './components/AdminPanel';
import { useNotifications } from './hooks/useNotifications';

const API_BASE = 'https://alluring-exploration-production-e73b.up.railway.app/api';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [filters, setFilters] = useState({
    leagues: [],
    teams: [],
    search: '',
  });
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([...LPL_TEAMS, ...IVL_TEAMS]);
  const [useApi, setUseApi] = useState(true);
  const [loading, setLoading] = useState(false);
  const [favoriteTeams, setFavoriteTeams] = useState(
    () => JSON.parse(localStorage.getItem('lpl_ivl_favoriteTeams') || '[]')
  );

  const { requestPermission, permission } = useNotifications(matches, favoriteTeams);

  useEffect(() => {
    loadMatches();
    loadTeams();
  }, [currentDate, useApi]);

  const loadMatches = async () => {
    if (useApi) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/matches`);
        const data = await response.json();
        setMatches(data.matches || []);
      } catch (error) {
        console.log('API 连接失败，使用 Mock 数据');
        setUseApi(false);
        setMatches(generateMockMatches(currentDate.getFullYear(), currentDate.getMonth()));
      } finally {
        setLoading(false);
      }
    } else {
      setMatches(generateMockMatches(currentDate.getFullYear(), currentDate.getMonth()));
    }
  };

  const toggleFavoriteTeam = (teamId) => {
    setFavoriteTeams(prev => {
      const next = prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId];
      localStorage.setItem('lpl_ivl_favoriteTeams', JSON.stringify(next));
      return next;
    });
  };

  const loadTeams = async () => {
    if (!useApi) return;
    try {
      const response = await fetch(`${API_BASE}/teams`);
      const data = await response.json();
      if (data.teams?.length > 0) setTeams(data.teams);
    } catch {}
  };

  const calendarDays = getCalendarDays(currentDate.getFullYear(), currentDate.getMonth());

  const handleDateClick = (date, activeFilters = filters) => {
    setSelectedDate(date);
    const dayMatches = getMatchesByDate(matches, date);

    const filteredMatches = dayMatches.filter(match => {
      if (!activeFilters.leagues.includes(match.league)) return false;
      if (activeFilters.teams.length > 0 && !activeFilters.teams.includes(match.homeTeam.id) && !activeFilters.teams.includes(match.awayTeam.id)) return false;
      if (activeFilters.search) {
        const searchLower = activeFilters.search.toLowerCase();
        return match.homeTeam.name.toLowerCase().includes(searchLower) ||
               match.awayTeam.name.toLowerCase().includes(searchLower);
      }
      return true;
    });

    if (filteredMatches.length > 0) setSelectedMatch(filteredMatches[0]);
  };

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
  };

  const handleFilterChange = (newFilters) => {
    const validTeamIds = new Set(
      allTeams
        .filter(team => newFilters.leagues.includes(team.league || team.region?.toLowerCase()))
        .map(team => team.id)
    );
    const sanitizedFilters = {
      ...newFilters,
      teams: newFilters.teams.filter(teamId => validTeamIds.has(teamId)),
    };

    setFilters(sanitizedFilters);
    if (selectedDate) {
      handleDateClick(selectedDate, sanitizedFilters);
    }
  };

  const handleAdminClick = () => {
    if (isAdminAuthed) {
      setShowAdmin(true);
    } else {
      setAuthPassword('');
      setAuthError('');
      setShowAuthModal(true);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword }),
      });
      if (response.ok) {
        setIsAdminAuthed(true);
        setAdminPassword(authPassword);
        setShowAuthModal(false);
        setShowAdmin(true);
      } else {
        setAuthError('密码错误，请重试');
      }
    } catch {
      setAuthError('无法连接服务器');
    }
  };

  const allTeams = teams;

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} adminPassword={adminPassword} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-lpl" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">主队还我上网权</h1>
                <p className="text-sm text-gray-500">LPL & IVL 赛程日历</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded bg-lpl"></div>
                <span>LPL</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded bg-ivl"></div>
                <span>IVL</span>
              </div>
              <button
                onClick={requestPermission}
                title={permission === 'granted' ? '赛前提醒已开启' : '开启赛前提醒'}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className={`w-5 h-5 ${permission === 'granted' ? 'text-lpl' : 'text-gray-400'}`} />
              </button>
              <button
                onClick={handleAdminClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="管理面板"
              >
                <Settings className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 管理员密码弹窗 */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-6 h-6 text-lpl" />
              <h2 className="text-xl font-bold text-gray-900">管理员验证</h2>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">请输入管理员密码</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-lpl/60 transition-colors"
                  placeholder="管理员密码"
                />
              </div>
              {authError && (
                <p className="text-red-500 text-sm">{authError}</p>
              )}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-500 transition-colors text-sm text-gray-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-lpl text-white font-bold rounded-lg hover:bg-lpl-dim transition-colors text-sm"
                >
                  确认
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-lpl/10 border-b border-lpl/20 px-4 py-2 text-center text-sm text-lpl">
          正在加载数据...
        </div>
      )}

      <FilterBar
        leagues={LEAGUES}
        teams={allTeams}
        filters={filters}
        onFilterChange={handleFilterChange}
        favoriteTeams={favoriteTeams}
        toggleFavoriteTeam={toggleFavoriteTeam}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <CalendarView
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              calendarDays={calendarDays}
              matches={matches}
              filters={filters}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              onMatchClick={handleMatchClick}
              selectedMatch={selectedMatch}
            />
          </div>

          <div className={`fixed right-0 top-20 h-[calc(100vh-5rem)] w-[28rem] max-w-[calc(100vw-1rem)] bg-white border-l border-t border-gray-200 shadow-xl transition-transform duration-300 z-40 overflow-hidden rounded-tl-2xl ${
            selectedMatch ? 'translate-x-0' : 'translate-x-full'
          }`}>
            {selectedMatch && (
              <MatchDetails
                match={selectedMatch}
                onClose={() => setSelectedMatch(null)}
                favoriteTeams={favoriteTeams}
                toggleFavoriteTeam={toggleFavoriteTeam}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-lpl"></div>
              <span>LPL 赛程</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-ivl"></div>
              <span>IVL 赛程</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded border border-gray-300"></div>
              <span>无比赛</span>
            </div>
            {!useApi && (
              <span className="text-xs text-gray-400">当前使用 Mock 数据</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;