import { format, eachDayOfInterval, startOfMonth, endOfMonth, getDay, isSameDay } from 'date-fns';

export const LPL_TEAMS = [
  { id: 'blg', name: 'BLG', fullName: 'Bilibili Gaming', region: 'LPL', league: 'lpl' },
  { id: 'tes', name: 'TES', fullName: 'Top Esports', region: 'LPL', league: 'lpl' },
  { id: 'jdg', name: 'JDG', fullName: 'JD Gaming', region: 'LPL', league: 'lpl' },
  { id: 'lng', name: 'LNG', fullName: 'LNG Esports', region: 'LPL', league: 'lpl' },
  { id: 'edg', name: 'EDG', fullName: 'Edward Gaming', region: 'LPL', league: 'lpl' },
  { id: 'wbg', name: 'WBG', fullName: 'Weibo Gaming', region: 'LPL', league: 'lpl' },
  { id: 'ig', name: 'IG', fullName: 'Invictus Gaming', region: 'LPL', league: 'lpl' },
  { id: 'al', name: 'AL', fullName: "Anyone's Legend", region: 'LPL', league: 'lpl' },
  { id: 'nip', name: 'NIP', fullName: 'Ninjas in Pyjamas', region: 'LPL', league: 'lpl' },
  { id: 'we', name: 'WE', fullName: 'Team WE', region: 'LPL', league: 'lpl' },
  { id: 'omg', name: 'OMG', fullName: 'Oh My God', region: 'LPL', league: 'lpl' },
  { id: 'up', name: 'UP', fullName: 'Ultra Prime', region: 'LPL', league: 'lpl' },
  { id: 'tt', name: 'TT', fullName: 'Thunder Talk Gaming', region: 'LPL', league: 'lpl' },
  { id: 'ldg', name: 'LDG', fullName: 'LDG', region: 'LPL', league: 'lpl' },
];

export const IVL_TEAMS = [
  { id: 'act', name: 'ACT', fullName: 'ACT', region: 'IVL', league: 'ivl' },
  { id: 'dou5', name: 'DOU5', fullName: 'DOU5', region: 'IVL', league: 'ivl' },
  { id: 'fpx-zq', name: 'FPX.ZQ', fullName: 'FunPlus Phoenix ZQ', region: 'IVL', league: 'ivl' },
  { id: 'gg', name: 'GG', fullName: 'GG Esports', region: 'IVL', league: 'ivl' },
  { id: 'gr', name: 'GR', fullName: 'GR', region: 'IVL', league: 'ivl' },
  { id: 'gw', name: 'GW', fullName: 'GW', region: 'IVL', league: 'ivl' },
  { id: 'mrc', name: 'MRC', fullName: 'MRC', region: 'IVL', league: 'ivl' },
  { id: 'te', name: 'TE', fullName: 'TE', region: 'IVL', league: 'ivl' },
  { id: 'wbg-ivl', name: 'WBG', fullName: 'Weibo Gaming IVL', region: 'IVL', league: 'ivl' },
  { id: 'wolves', name: 'Wolves', fullName: 'Wolves Esports', region: 'IVL', league: 'ivl' },
];

export const LEAGUES = [
  { id: 'lpl', name: 'LPL', color: '#4f6ef7', region: '英雄联盟职业联赛' },
  { id: 'ivl', name: 'IVL', color: '#e06c2b', region: '第五人格职业联赛' },
];

export const generateMockMatches = (year, month) => {
  const matches = [];
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const lplMatchTimes = ['17:00', '19:00', '20:00', '21:00'];
  const ivlMatchTimes = ['16:00', '18:00', '20:00'];

  days.forEach((day) => {
    const dayOfWeek = getDay(day);

    // 周一到周四：更多比赛
    // 周五到周日：比赛最多
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const matchMultiplier = isWeekend ? 3 : 1;

    // LPL 比赛生成
    const lplCount = Math.floor(Math.random() * matchMultiplier) + (Math.random() > 0.5 ? 1 : 0);
    for (let i = 0; i < lplCount; i++) {
      const homeTeam = LPL_TEAMS[Math.floor(Math.random() * LPL_TEAMS.length)];
      let awayTeam = LPL_TEAMS[Math.floor(Math.random() * LPL_TEAMS.length)];
      while (awayTeam.id === homeTeam.id) {
        awayTeam = LPL_TEAMS[Math.floor(Math.random() * LPL_TEAMS.length)];
      }

      matches.push({
        id: `lpl-${day.getTime()}-${i}`,
        league: 'lpl',
        date: format(day, 'yyyy-MM-dd'),
        time: lplMatchTimes[i % lplMatchTimes.length],
        homeTeam,
        awayTeam,
        status: Math.random() > 0.3 ? 'scheduled' : 'completed',
        homeScore: Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0,
        awayScore: Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0,
        stage: ['常规赛', '季后赛', '夏季赛'][Math.floor(Math.random() * 3)],
        venue: ['上海虹桥天地演艺中心', '苏州奥林匹克体育中心', '西安曲江国际会展中心', '成都高新体育中心'][Math.floor(Math.random() * 4)],
      });
    }

    // IVL 比赛生成
    const ivlCount = Math.floor(Math.random() * matchMultiplier) + (Math.random() > 0.5 ? 1 : 0);
    for (let i = 0; i < ivlCount; i++) {
      const homeTeam = IVL_TEAMS[Math.floor(Math.random() * IVL_TEAMS.length)];
      let awayTeam = IVL_TEAMS[Math.floor(Math.random() * IVL_TEAMS.length)];
      while (awayTeam.id === homeTeam.id) {
        awayTeam = IVL_TEAMS[Math.floor(Math.random() * IVL_TEAMS.length)];
      }

      matches.push({
        id: `ivl-${day.getTime()}-${i}`,
        league: 'ivl',
        date: format(day, 'yyyy-MM-dd'),
        time: ivlMatchTimes[i % ivlMatchTimes.length],
        homeTeam,
        awayTeam,
        status: Math.random() > 0.3 ? 'scheduled' : 'completed',
        homeScore: Math.random() > 0.5 ? Math.floor(Math.random() * 4) : 0,
        awayScore: Math.random() > 0.5 ? Math.floor(Math.random() * 4) : 0,
        stage: ['常规赛', '季后赛', '秋季赛'][Math.floor(Math.random() * 3)],
        venue: ['上海K11', '深圳湾体育中心', '广州天河体育中心'][Math.floor(Math.random() * 3)],
      });
    }
  });

  return matches.sort((a, b) => {
    const [aDay, aTime] = [a.date, a.time];
    const [bDay, bTime] = [b.date, b.time];
    if (aDay !== bDay) return aDay.localeCompare(bDay);
    return aTime.localeCompare(bTime);
  });
};

export const getMatchesByDate = (matches, date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return matches.filter(m => m.date === dateStr);
};

export const getTeamMatches = (matches, teamId) => {
  return matches.filter(m => m.homeTeam.id === teamId || m.awayTeam.id === teamId);
};

export const getCalendarDays = (year, month) => {
  const startDate = startOfMonth(new Date(year, month));
  const endDate = endOfMonth(new Date(year, month));
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // 添加前导空白日期
  const firstDay = getDay(startDate);
  const paddingDays = Array(firstDay).fill(null);

  // 添加后续空白日期，填满6行（42格）
  const totalPadding = (42 - days.length - firstDay) % 7;
  const trailingPadding = Array(totalPadding).fill(null);

  return [...paddingDays, ...days, ...trailingPadding];
};

export const statusLabels = {
  scheduled: '未开始',
  completed: '已结束',
  live: '进行中',
};