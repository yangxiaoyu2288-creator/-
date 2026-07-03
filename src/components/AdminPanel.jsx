import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Plus, Trash2, Edit, X, RefreshCw, Users, Gamepad2, Download, ArrowLeft } from 'lucide-react';

const VENUES = {
  lpl: ['上海虹桥天地演艺中心', '苏州奥林匹克体育中心', '西安曲江国际会展中心', '成都高新体育中心'],
  ivl: ['上海K11', '深圳湾体育中心', '广州天河体育中心'],
};

const STAGES = ['常规赛', '季后赛', '夏季赛', '春季赛'];

const API_BASE = 'https://alluring-exploration-production-e73b.up.railway.app/api';

const AdminPanel = ({ onBack, adminPassword }) => {
  const [password] = useState(adminPassword);
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 新比赛表单状态
  const [newMatch, setNewMatch] = useState({
    league: 'lpl',
    date: '',
    time: '',
    homeTeam: '',
    awayTeam: '',
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    stage: '常规赛',
    venue: '',
  });

  // 新战队表单状态
  const [newTeam, setNewTeam] = useState({
    id: '',
    name: '',
    fullName: '',
    league: 'lpl',
  });

  useEffect(() => {
    loadMatches();
    loadTeams();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await fetch(`${API_BASE}/matches`);
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      showMessage('error', '加载比赛数据失败');
    }
  };

  const loadTeams = async () => {
    try {
      const response = await fetch(`${API_BASE}/teams`);
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      showMessage('error', '加载战队数据失败');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getTeamsByLeague = (league) => teams.filter(t => t.league === league);

  const getExportRows = () => matches.map(match => ({
    ID: match.id,
    联赛: match.league?.toUpperCase(),
    日期: match.date,
    时间: match.time,
    主队: match.homeTeam?.name,
    客队: match.awayTeam?.name,
    主队得分: match.homeScore,
    客队得分: match.awayScore,
    状态: match.status,
    赛段: match.stage,
    场地: match.venue,
  }));

  const exportCSV = () => {
    const rows = getExportRows();
    const headers = Object.keys(rows[0] || {
      ID: '', 联赛: '', 日期: '', 时间: '', 主队: '', 客队: '', 主队得分: '', 客队得分: '', 状态: '', 赛段: '', 场地: '',
    });
    const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [headers, ...rows.map(row => headers.map(header => row[header]))]
      .map(row => row.map(escapeCell).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `matches-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(getExportRows());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '赛程');
    XLSX.writeFile(workbook, `matches-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ========== 比赛操作 ==========

  const handleMatchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const leagueTeams = getTeamsByLeague(newMatch.league);
      const homeTeam = leagueTeams.find(t => t.id === newMatch.homeTeam);
      const awayTeam = leagueTeams.find(t => t.id === newMatch.awayTeam);

      if (!homeTeam || !awayTeam) {
        throw new Error('请选择有效的战队');
      }

      const matchData = {
        ...newMatch,
        homeTeam,
        awayTeam,
        homeScore: parseInt(newMatch.homeScore) || 0,
        awayScore: parseInt(newMatch.awayScore) || 0,
      };

      const response = await fetch(`${API_BASE}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...matchData, password }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('success', '比赛添加成功');
        setNewMatch({
          league: 'lpl',
          date: '',
          time: '',
          homeTeam: '',
          awayTeam: '',
          homeScore: 0,
          awayScore: 0,
          status: 'scheduled',
          stage: '常规赛',
          venue: '',
        });
        setShowAddForm(false);
        loadMatches();
      } else {
        throw new Error(result.error || '添加失败');
      }
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchDelete = async (matchId) => {
    if (!confirm('确定要删除这场比赛吗？')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/matches/${matchId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        showMessage('success', '删除成功');
        loadMatches();
      } else {
        const result = await response.json();
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchUpdate = async (matchId, updates) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, password }),
      });

      if (response.ok) {
        showMessage('success', '更新成功');
        setEditingMatch(null);
        loadMatches();
      } else {
        const result = await response.json();
        throw new Error(result.error || '更新失败');
      }
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== 战队操作 ==========

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!newTeam.id || !newTeam.name) {
        throw new Error('战队 ID 和名称为必填项');
      }

      const response = await fetch(`${API_BASE}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTeam, password }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('success', '战队添加成功');
        setNewTeam({ id: '', name: '', fullName: '', league: 'lpl' });
        setShowAddForm(false);
        loadTeams();
      } else {
        throw new Error(result.error || '添加失败');
      }
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamDelete = async (teamId) => {
    if (!confirm('确定要删除这个战队吗？')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/teams/${teamId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('success', '删除成功');
        loadTeams();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamUpdate = async (teamId, updates) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, password }),
      });

      if (response.ok) {
        showMessage('success', '更新成功');
        setEditingTeam(null);
        loadTeams();
      } else {
        const result = await response.json();
        throw new Error(result.error || '更新失败');
      }
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const leagueTeams = getTeamsByLeague(newMatch.league);

  return (
    <div className="min-h-screen bg-midnight text-midnight-text p-6">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 bg-midnight-card border border-midnight-border rounded-lg hover:border-midnight-text transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回日历</span>
            </button>
            <h1 className="text-3xl font-bold">数据管理</h1>
          </div>
          <button
            onClick={() => { loadMatches(); loadTeams(); }}
            className="flex items-center space-x-2 px-4 py-2 bg-midnight-card border border-midnight-border rounded-lg hover:border-midnight-text transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>刷新</span>
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => { setActiveTab('matches'); setShowAddForm(false); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'matches' ? 'bg-lpl text-white font-bold' : 'bg-midnight-card border border-midnight-border'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>比赛管理</span>
          </button>
          <button
            onClick={() => { setActiveTab('teams'); setShowAddForm(false); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'teams' ? 'bg-lpl text-white font-bold' : 'bg-midnight-card border border-midnight-border'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>战队管理</span>
          </button>
        </div>

        {/* 消息提示 */}
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-lpl/20 text-lpl border border-lpl/30' : 'bg-ivl/20 text-ivl border border-ivl/30'
          }`}>
            {message.text}
          </div>
        )}

        {/* ========== 比赛管理 ========== */}
        {activeTab === 'matches' && (
          <>
            <div className="flex justify-end space-x-2 mb-4">
              <button
                onClick={exportCSV}
                disabled={matches.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-midnight-card border border-midnight-border rounded-lg hover:border-midnight-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>导出 CSV</span>
              </button>
              <button
                onClick={exportXLSX}
                disabled={matches.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-midnight-card border border-midnight-border rounded-lg hover:border-midnight-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>导出 XLSX</span>
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center space-x-2 px-4 py-2 bg-lpl text-white font-bold rounded-lg hover:bg-lpl-glow transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>添加比赛</span>
              </button>
            </div>

            {/* 添加比赛表单 */}
            {showAddForm && (
              <div className="bg-midnight-card border border-midnight-border rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">添加新比赛</h2>
                  <button onClick={() => setShowAddForm(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleMatchSubmit} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">联赛</label>
                    <select
                      value={newMatch.league}
                      onChange={(e) => setNewMatch({ ...newMatch, league: e.target.value, homeTeam: '', awayTeam: '', venue: '' })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                    >
                      <option value="lpl">LPL (英雄联盟)</option>
                      <option value="ivl">IVL (王者荣耀)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">赛程阶段</label>
                    <select
                      value={newMatch.stage}
                      onChange={(e) => setNewMatch({ ...newMatch, stage: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                    >
                      {STAGES.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">日期</label>
                    <input
                      type="date"
                      value={newMatch.date}
                      onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">时间</label>
                    <input
                      type="time"
                      value={newMatch.time}
                      onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">主队</label>
                    <select
                      value={newMatch.homeTeam}
                      onChange={(e) => setNewMatch({ ...newMatch, homeTeam: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                      required
                    >
                      <option value="">选择主队</option>
                      {leagueTeams.map(team => (
                        <option key={team.id} value={team.id}>{team.name} - {team.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">客队</label>
                    <select
                      value={newMatch.awayTeam}
                      onChange={(e) => setNewMatch({ ...newMatch, awayTeam: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                      required
                    >
                      <option value="">选择客队</option>
                      {leagueTeams.map(team => (
                        <option key={team.id} value={team.id}>{team.name} - {team.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">主队得分</label>
                    <input
                      type="number"
                      value={newMatch.homeScore}
                      onChange={(e) => setNewMatch({ ...newMatch, homeScore: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">客队得分</label>
                    <input
                      type="number"
                      value={newMatch.awayScore}
                      onChange={(e) => setNewMatch({ ...newMatch, awayScore: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">状态</label>
                    <select
                      value={newMatch.status}
                      onChange={(e) => setNewMatch({ ...newMatch, status: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                    >
                      <option value="scheduled">未开始</option>
                      <option value="live">进行中</option>
                      <option value="completed">已结束</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">场地</label>
                    <select
                      value={newMatch.venue}
                      onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                    >
                      <option value="">选择场地</option>
                      {VENUES[newMatch.league]?.map(venue => (
                        <option key={venue} value={venue}>{venue}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 bg-lpl text-white font-bold rounded-lg hover:bg-lpl-glow transition-colors disabled:opacity-50"
                    >
                      {loading ? '添加中...' : '添加比赛'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 比赛列表 */}
            <div className="bg-midnight-card border border-midnight-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-midnight-surface border-b border-midnight-border text-sm font-medium">
                <div className="col-span-2">联赛</div>
                <div className="col-span-2">日期时间</div>
                <div className="col-span-3">对阵</div>
                <div className="col-span-2">比分</div>
                <div className="col-span-1">状态</div>
                <div className="col-span-2">操作</div>
              </div>

              <div className="divide-y divide-midnight-border max-h-96 overflow-y-auto">
                {matches.length === 0 ? (
                  <div className="px-4 py-8 text-center text-midnight-muted">
                    暂无比赛数据，点击"添加比赛"开始添加
                  </div>
                ) : (
                  matches.map((match) => (
                    <div key={match.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-midnight-surface">
                      <div className="col-span-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          match.league === 'lpl' ? 'bg-lpl/20 text-lpl' : 'bg-ivl/20 text-ivl'
                        }`}>
                          {match.league.toUpperCase()}
                        </span>
                      </div>

                      <div className="col-span-2 text-sm">
                        <div>{match.date}</div>
                        <div className="text-midnight-muted">{match.time}</div>
                      </div>

                      <div className="col-span-3">
                        <div className={`font-medium ${match.league === 'lpl' ? 'text-lpl' : 'text-ivl'}`}>
                          {match.homeTeam?.name || '?'} vs {match.awayTeam?.name || '?'}
                        </div>
                        <div className="text-xs text-midnight-muted">{match.stage}</div>
                      </div>

                      <div className="col-span-2">
                        {match.status === 'completed' ? (
                          <span className="text-lg font-bold">{match.homeScore} : {match.awayScore}</span>
                        ) : (
                          <span className="text-midnight-muted">VS</span>
                        )}
                      </div>

                      <div className="col-span-1">
                        <span className="text-sm">
                          {match.status === 'scheduled' && '未开始'}
                          {match.status === 'live' && '进行中'}
                          {match.status === 'completed' && '已结束'}
                        </span>
                      </div>

                      <div className="col-span-2 flex space-x-2">
                        {editingMatch === match.id ? (
                          <>
                            <button
                              onClick={() => handleMatchUpdate(match.id, { status: 'live' })}
                              className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-500 rounded"
                            >
                              开始
                            </button>
                            <button
                              onClick={() => handleMatchUpdate(match.id, { status: 'completed' })}
                              className="px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded"
                            >
                              结束
                            </button>
                            <button
                              onClick={() => setEditingMatch(null)}
                              className="px-2 py-1 text-xs bg-midnight-border rounded"
                            >
                              取消
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingMatch(match.id)}
                              className="p-1 hover:text-lpl transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMatchDelete(match.id)}
                              className="p-1 hover:text-ivl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 统计信息 */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-midnight-card border border-midnight-border rounded-lg p-4">
                <div className="text-sm text-midnight-muted">总比赛数</div>
                <div className="text-2xl font-bold">{matches.length}</div>
              </div>
              <div className="bg-lpl-bg border border-lpl/30 rounded-lg p-4">
                <div className="text-sm text-midnight-muted">LPL 比赛</div>
                <div className="text-2xl font-bold text-lpl">{matches.filter(m => m.league === 'lpl').length}</div>
              </div>
              <div className="bg-ivl-bg border border-ivl/30 rounded-lg p-4">
                <div className="text-sm text-midnight-muted">IVL 比赛</div>
                <div className="text-2xl font-bold text-ivl">{matches.filter(m => m.league === 'ivl').length}</div>
              </div>
              <div className="bg-midnight-card border border-midnight-border rounded-lg p-4">
                <div className="text-sm text-midnight-muted">未开始</div>
                <div className="text-2xl font-bold">{matches.filter(m => m.status === 'scheduled').length}</div>
              </div>
            </div>
          </>
        )}

        {/* ========== 战队管理 ========== */}
        {activeTab === 'teams' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center space-x-2 px-4 py-2 bg-lpl text-white font-bold rounded-lg hover:bg-lpl-glow transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>添加战队</span>
              </button>
            </div>

            {/* 添加战队表单 */}
            {showAddForm && (
              <div className="bg-midnight-card border border-midnight-border rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">添加新战队</h2>
                  <button onClick={() => setShowAddForm(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleTeamSubmit} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">战队 ID (英文缩写)</label>
                    <input
                      type="text"
                      value={newTeam.id}
                      onChange={(e) => setNewTeam({ ...newTeam, id: e.target.value.toLowerCase() })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                      placeholder="如: blg, tes"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">战队简称</label>
                    <input
                      type="text"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                      placeholder="如: BLG, TES"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">战队全称</label>
                    <input
                      type="text"
                      value={newTeam.fullName}
                      onChange={(e) => setNewTeam({ ...newTeam, fullName: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                      placeholder="如: Bilibili Gaming"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-midnight-muted mb-2">所属联赛</label>
                    <select
                      value={newTeam.league}
                      onChange={(e) => setNewTeam({ ...newTeam, league: e.target.value })}
                      className="w-full px-4 py-2 bg-midnight-surface border border-midnight-border rounded-lg focus:outline-none focus:border-lpl/50"
                    >
                      <option value="lpl">LPL (英雄联盟)</option>
                      <option value="ivl">IVL (王者荣耀)</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 bg-lpl text-white font-bold rounded-lg hover:bg-lpl-glow transition-colors disabled:opacity-50"
                    >
                      {loading ? '添加中...' : '添加战队'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 战队列表 */}
            <div className="grid grid-cols-2 gap-4">
              {/* LPL 战队 */}
              <div className="bg-midnight-card border border-lpl/30 rounded-lg overflow-hidden">
                <div className="bg-lpl/10 px-4 py-3 border-b border-lpl/30">
                  <h3 className="text-lg font-bold text-lpl">LPL 战队 ({getTeamsByLeague('lpl').length})</h3>
                </div>
                <div className="divide-y divide-midnight-border max-h-80 overflow-y-auto">
                  {getTeamsByLeague('lpl').map((team) => (
                    <div key={team.id} className="px-4 py-3 hover:bg-midnight-surface flex items-center justify-between">
                      {editingTeam === team.id ? (
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={team.name}
                            onChange={(e) => {
                              const updated = teams.map(t => t.id === team.id ? { ...t, name: e.target.value } : t);
                              setTeams(updated);
                            }}
                            className="px-2 py-1 bg-midnight-surface border border-midnight-border rounded text-sm"
                          />
                          <input
                            type="text"
                            value={team.fullName}
                            onChange={(e) => {
                              const updated = teams.map(t => t.id === team.id ? { ...t, fullName: e.target.value } : t);
                              setTeams(updated);
                            }}
                            className="px-2 py-1 bg-midnight-surface border border-midnight-border rounded text-sm col-span-2"
                          />
                          <div className="col-span-3 flex space-x-2 mt-1">
                            <button
                              onClick={() => handleTeamUpdate(team.id, { name: team.name, fullName: team.fullName })}
                              className="px-2 py-1 text-xs bg-lpl/20 text-lpl rounded"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingTeam(null)}
                              className="px-2 py-1 text-xs bg-midnight-border rounded"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="font-bold text-lpl">{team.name}</div>
                            <div className="text-xs text-midnight-muted">{team.fullName}</div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingTeam(team.id)}
                              className="p-1 hover:text-lpl transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTeamDelete(team.id)}
                              className="p-1 hover:text-ivl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* IVL 战队 */}
              <div className="bg-midnight-card border border-ivl/30 rounded-lg overflow-hidden">
                <div className="bg-ivl/10 px-4 py-3 border-b border-ivl/30">
                  <h3 className="text-lg font-bold text-ivl">IVL 战队 ({getTeamsByLeague('ivl').length})</h3>
                </div>
                <div className="divide-y divide-midnight-border max-h-80 overflow-y-auto">
                  {getTeamsByLeague('ivl').map((team) => (
                    <div key={team.id} className="px-4 py-3 hover:bg-midnight-surface flex items-center justify-between">
                      {editingTeam === team.id ? (
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={team.name}
                            onChange={(e) => {
                              const updated = teams.map(t => t.id === team.id ? { ...t, name: e.target.value } : t);
                              setTeams(updated);
                            }}
                            className="px-2 py-1 bg-midnight-surface border border-midnight-border rounded text-sm"
                          />
                          <input
                            type="text"
                            value={team.fullName}
                            onChange={(e) => {
                              const updated = teams.map(t => t.id === team.id ? { ...t, fullName: e.target.value } : t);
                              setTeams(updated);
                            }}
                            className="px-2 py-1 bg-midnight-surface border border-midnight-border rounded text-sm col-span-2"
                          />
                          <div className="col-span-3 flex space-x-2 mt-1">
                            <button
                              onClick={() => handleTeamUpdate(team.id, { name: team.name, fullName: team.fullName })}
                              className="px-2 py-1 text-xs bg-ivl/20 text-ivl rounded"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingTeam(null)}
                              className="px-2 py-1 text-xs bg-midnight-border rounded"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="font-bold text-ivl">{team.name}</div>
                            <div className="text-xs text-midnight-muted">{team.fullName}</div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingTeam(team.id)}
                              className="p-1 hover:text-ivl transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTeamDelete(team.id)}
                              className="p-1 hover:text-ivl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;