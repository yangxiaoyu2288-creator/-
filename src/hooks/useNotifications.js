import { useEffect, useState } from 'react';

const NOTIFIED_KEY = 'lpl_ivl_notified';
const REMIND_BEFORE_MS = 15 * 60 * 1000;

export function useNotifications(matches, favoriteTeams) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  useEffect(() => {
    const checkAndNotify = () => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      if (!matches.length || !favoriteTeams.length) return;

      const notified = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]');
      const now = Date.now();
      let changed = false;

      matches.forEach(match => {
        if (match.status !== 'scheduled') return;
        if (notified.includes(match.id)) return;
        if (!favoriteTeams.includes(match.homeTeam?.id) && !favoriteTeams.includes(match.awayTeam?.id)) return;

        const matchTime = new Date(`${match.date}T${match.time}:00`).getTime();
        const diff = matchTime - now;

        if (diff > 0 && diff <= REMIND_BEFORE_MS) {
          new Notification('比赛即将开始！', {
            body: `${match.homeTeam.name} vs ${match.awayTeam.name}  ${match.time} 开始`,
            icon: '/favicon.ico',
          });
          notified.push(match.id);
          changed = true;
        }
      });

      if (changed) localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified));
    };

    checkAndNotify();
    const id = setInterval(checkAndNotify, 60_000);
    return () => clearInterval(id);
  }, [matches, favoriteTeams]);

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return;
    }
    setPermission(Notification.permission);
  };

  return { requestPermission, permission };
}