const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'matches.json');
const TEAMS_FILE = path.join(__dirname, 'data', 'teams.json');

// 简单密码保护
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lpl2026';

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 数据文件操作
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { matches: [], lastUpdated: null };
    }
    throw error;
  }
}

async function writeData(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

async function readTeams() {
  try {
    const data = await fs.readFile(TEAMS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { teams: [] };
    }
    throw error;
  }
}

async function writeTeams(teams) {
  await fs.mkdir(path.dirname(TEAMS_FILE), { recursive: true });
  await fs.writeFile(TEAMS_FILE, JSON.stringify({ teams }, null, 2), 'utf8');
}

// 密码验证中间件
function verifyPassword(req, res, next) {
  const { password } = req.body;

  if (!password) {
    return res.status(401).json({ error: '需要密码' });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '密码错误' });
  }

  // 移除密码后继续
  delete req.body.password;
  next();
}

// 管理员登录校验
app.post('/api/admin/login', verifyPassword, (req, res) => {
  res.json({ message: '登录成功' });
});

// 获取所有比赛
app.get('/api/matches', async (req, res) => {
  try {
    const { matches, lastUpdated } = await readData();
    res.json({ matches, lastUpdated });
  } catch (error) {
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 按日期获取比赛
app.get('/api/matches/date/:date', async (req, res) => {
  try {
    const { matches } = await readData();
    const dateMatches = matches.filter(m => m.date === req.params.date);
    res.json({ matches: dateMatches });
  } catch (error) {
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 按联赛获取比赛
app.get('/api/matches/league/:league', async (req, res) => {
  try {
    const { matches } = await readData();
    const leagueMatches = matches.filter(m => m.league === req.params.league);
    res.json({ matches: leagueMatches });
  } catch (error) {
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 按战队获取比赛
app.get('/api/matches/team/:teamId', async (req, res) => {
  try {
    const { matches } = await readData();
    const teamMatches = matches.filter(
      m => m.homeTeam.id === req.params.teamId || m.awayTeam.id === req.params.teamId
    );
    res.json({ matches: teamMatches });
  } catch (error) {
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 添加比赛（需要密码）
app.post('/api/matches', verifyPassword, async (req, res) => {
  try {
    const data = await readData();

    const newMatch = {
      id: `${req.body.league}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...req.body,
    };

    data.matches.push(newMatch);
    data.lastUpdated = new Date().toISOString();

    await writeData(data);

    res.json({ message: '比赛添加成功', match: newMatch });
  } catch (error) {
    console.error('添加比赛失败:', error);
    res.status(500).json({ error: '添加比赛失败' });
  }
});

// 批量添加比赛（需要密码）
app.post('/api/matches/batch', verifyPassword, async (req, res) => {
  try {
    const { matches } = req.body;

    if (!Array.isArray(matches) || matches.length === 0) {
      return res.status(400).json({ error: '需要提供比赛数组' });
    }

    const data = await readData();

    const newMatches = matches.map(match => ({
      id: `${match.league}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...match,
    }));

    data.matches.push(...newMatches);
    data.lastUpdated = new Date().toISOString();

    await writeData(data);

    res.json({ message: `成功添加 ${newMatches.length} 场比赛`, matches: newMatches });
  } catch (error) {
    console.error('批量添加失败:', error);
    res.status(500).json({ error: '批量添加失败' });
  }
});

// 更新比赛（需要密码）
app.put('/api/matches/:id', verifyPassword, async (req, res) => {
  try {
    const data = await readData();
    const index = data.matches.findIndex(m => m.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '比赛不存在' });
    }

    data.matches[index] = {
      ...data.matches[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString(),
    };

    data.lastUpdated = new Date().toISOString();

    await writeData(data);

    res.json({ message: '比赛更新成功', match: data.matches[index] });
  } catch (error) {
    console.error('更新比赛失败:', error);
    res.status(500).json({ error: '更新比赛失败' });
  }
});

// 删除比赛（需要密码）
app.delete('/api/matches/:id', verifyPassword, async (req, res) => {
  try {
    const data = await readData();
    const index = data.matches.findIndex(m => m.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '比赛不存在' });
    }

    data.matches.splice(index, 1);
    data.lastUpdated = new Date().toISOString();

    await writeData(data);

    res.json({ message: '比赛删除成功' });
  } catch (error) {
    console.error('删除比赛失败:', error);
    res.status(500).json({ error: '删除比赛失败' });
  }
});

// 清空所有数据（需要密码）
app.delete('/api/matches', verifyPassword, async (req, res) => {
  try {
    await writeData({ matches: [], lastUpdated: null });
    res.json({ message: '所有数据已清空' });
  } catch (error) {
    console.error('清空数据失败:', error);
    res.status(500).json({ error: '清空数据失败' });
  }
});

// 获取统计信息
app.get('/api/stats', async (req, res) => {
  try {
    const { matches } = await readData();

    const stats = {
      total: matches.length,
      lpl: matches.filter(m => m.league === 'lpl').length,
      ivl: matches.filter(m => m.league === 'ivl').length,
      byStatus: {
        scheduled: matches.filter(m => m.status === 'scheduled').length,
        live: matches.filter(m => m.status === 'live').length,
        completed: matches.filter(m => m.status === 'completed').length,
      },
      byMonth: {},
    };

    matches.forEach(match => {
      const month = match.date.substring(0, 7);
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: '获取统计失败' });
  }
});

// ========== 战队管理 API ==========

// 获取所有战队
app.get('/api/teams', async (req, res) => {
  try {
    const { teams } = await readTeams();
    res.json({ teams });
  } catch (error) {
    res.status(500).json({ error: '读取战队数据失败' });
  }
});

// 按联赛获取战队
app.get('/api/teams/league/:league', async (req, res) => {
  try {
    const { teams } = await readTeams();
    const leagueTeams = teams.filter(t => t.league === req.params.league);
    res.json({ teams: leagueTeams });
  } catch (error) {
    res.status(500).json({ error: '读取战队数据失败' });
  }
});

// 获取单个战队
app.get('/api/teams/:id', async (req, res) => {
  try {
    const { teams } = await readTeams();
    const team = teams.find(t => t.id === req.params.id);
    if (!team) {
      return res.status(404).json({ error: '战队不存在' });
    }
    res.json({ team });
  } catch (error) {
    res.status(500).json({ error: '读取战队数据失败' });
  }
});

// 添加战队（需要密码）
app.post('/api/teams', verifyPassword, async (req, res) => {
  try {
    const { teams } = await readTeams();

    // 检查 ID 是否已存在
    if (teams.find(t => t.id === req.body.id)) {
      return res.status(400).json({ error: '战队 ID 已存在' });
    }

    const newTeam = {
      id: req.body.id,
      name: req.body.name,
      fullName: req.body.fullName || req.body.name,
      league: req.body.league,
      createdAt: new Date().toISOString(),
      ...req.body,
    };

    teams.push(newTeam);
    await writeTeams(teams);

    res.json({ message: '战队添加成功', team: newTeam });
  } catch (error) {
    console.error('添加战队失败:', error);
    res.status(500).json({ error: '添加战队失败' });
  }
});

// 更新战队（需要密码）
app.put('/api/teams/:id', verifyPassword, async (req, res) => {
  try {
    const { teams } = await readTeams();
    const index = teams.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '战队不存在' });
    }

    teams[index] = {
      ...teams[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString(),
    };

    await writeTeams(teams);

    res.json({ message: '战队更新成功', team: teams[index] });
  } catch (error) {
    console.error('更新战队失败:', error);
    res.status(500).json({ error: '更新战队失败' });
  }
});

// 删除战队（需要密码）
app.delete('/api/teams/:id', verifyPassword, async (req, res) => {
  try {
    const { teams } = await readTeams();
    const index = teams.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: '战队不存在' });
    }

    // 检查是否有比赛引用此战队
    const { matches } = await readData();
    const hasMatches = matches.some(
      m => m.homeTeam.id === req.params.id || m.awayTeam.id === req.params.id
    );

    if (hasMatches) {
      return res.status(400).json({ error: '该战队有相关比赛记录，无法删除' });
    }

    teams.splice(index, 1);
    await writeTeams(teams);

    res.json({ message: '战队删除成功' });
  } catch (error) {
    console.error('删除战队失败:', error);
    res.status(500).json({ error: '删除战队失败' });
  }
});

// 批量初始化战队数据（需要密码）
app.post('/api/teams/initialize', verifyPassword, async (req, res) => {
  try {
    const { teams } = req.body;

    if (!Array.isArray(teams) || teams.length === 0) {
      return res.status(400).json({ error: '需要提供战队数组' });
    }

    await writeTeams(teams);

    res.json({ message: `成功初始化 ${teams.length} 个战队`, teams });
  } catch (error) {
    console.error('初始化战队失败:', error);
    res.status(500).json({ error: '初始化战队失败' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API 文档: http://localhost:${PORT}/api`);
});

module.exports = app;