import { useState, useEffect } from 'react';

export interface FootballMatch {
  id: string;
  home: string;
  homeShort: string;
  away: string;
  awayShort: string;
  date: Date;
  time: string;
  competition: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'upcoming' | 'live' | 'finished';
}

const LEAGUES = [
  { id: 'fra.1',          name: 'Ligue 1',          kw: ['psg','paris','marseille','om','lyon','ol','monaco','lille','nice','lens','rennes','nantes','toulouse','strasbourg','brest','reims','montpellier','auxerre','angers','lorient','metz','havre','clermont','saint-etienne','asse'] },
  { id: 'eng.1',          name: 'Premier League',   kw: ['arsenal','chelsea','liverpool','manchester','man city','man united','man utd','tottenham','spurs','everton','newcastle','aston villa','brighton','brentford','west ham','wolves','fulham','bournemouth','crystal','palace','nottingham','luton','burnley','sheffield'] },
  { id: 'esp.1',          name: 'La Liga',           kw: ['real madrid','barcelona','atletico','sevilla','valencia','athletic','sociedad','betis','villarreal','osasuna','girona','barça','barca','espanyol','alaves','celta','getafe','mallorca','rayo','valladolid','las palmas','cadiz','granada'] },
  { id: 'ger.1',          name: 'Bundesliga',        kw: ['bayern','dortmund','leipzig','leverkusen','frankfurt','wolfsburg','freiburg','gladbach','union berlin','werder','bochum','augsburg','mainz','köln','koln','stuttgart','hoffenheim','hertha','darmstadt','heidenheim','monchengladbach'] },
  { id: 'ita.1',          name: 'Serie A',           kw: ['inter','milan','juventus','napoli','roma','lazio','fiorentina','atalanta','torino','bologna','monza','udinese','sassuolo','empoli','lecce','salernitana','frosinone','genoa','cagliari','hellas verona','venezia','parma','como'] },
  { id: 'UEFA.CHAMPIONS', name: 'Champions League',  kw: [] }, // always include
];

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '').trim();
}

function teamMatches(teamName: string, cfgTeams: string[]): boolean {
  const tn = norm(teamName);
  return cfgTeams.some(t => { const tc = norm(t); return tn.includes(tc) || tc.includes(tn); });
}

async function fetchLeague(leagueId: string): Promise<FootballMatch[]> {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
  const now  = new Date();
  const from = new Date(now.getTime() - 7 * 864e5);
  const to   = new Date(now.getTime() + 30 * 864e5);

  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard?dates=${fmt(from)}-${fmt(to)}&limit=50`;
  const res  = await fetch(url);
  if (!res.ok) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();

  return (data.events ?? []).map((ev: any): FootballMatch | null => {
    const comp  = ev.competitions?.[0];
    if (!comp) return null;
    const home  = comp.competitors?.find((c: any) => c.homeAway === 'home');
    const away  = comp.competitors?.find((c: any) => c.homeAway === 'away');
    if (!home || !away) return null;
    const state = comp.status?.type?.state ?? 'pre';
    const name  = comp.status?.type?.name  ?? '';
    const d     = new Date(ev.date);
    return {
      id:          ev.id,
      home:        home.team.displayName,
      homeShort:   home.team.shortDisplayName ?? home.team.abbreviation ?? home.team.displayName,
      away:        away.team.displayName,
      awayShort:   away.team.shortDisplayName ?? away.team.abbreviation ?? away.team.displayName,
      date:        d,
      time:        d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }),
      competition: LEAGUES.find(l => l.id === leagueId)?.name ?? leagueId,
      homeScore:   state !== 'pre' ? Number(home.score) : null,
      awayScore:   state !== 'pre' ? Number(away.score) : null,
      status:      name.includes('IN_PROGRESS') ? 'live' : state === 'post' ? 'finished' : 'upcoming',
    };
  }).filter(Boolean) as FootballMatch[];
}

const CACHE = new Map<string, { data: FootballMatch[]; ts: number }>();
const TTL   = 15 * 60_000; // 15 min

/** Read all cached matches for the given teams (populated when the widget is visible). */
export function getLastMatches(teams: string[]): FootballMatch[] {
  if (!teams.length) return [];
  const all = Array.from(CACHE.values()).flatMap(e => e.data);
  return all
    .filter(m => teamMatches(m.home, teams) || teamMatches(m.away, teams))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 8);
}

export function useFootball(teams: string[]) {
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!teams.length) { setLoading(false); return; }
    let cancelled = false;

    const teamNorms  = teams.map(norm);
    const toFetch    = LEAGUES.filter(l =>
      l.kw.length === 0 ||
      l.kw.some(kw => teamNorms.some(t => t.includes(kw) || kw.includes(t)))
    );
    const cacheKey   = toFetch.map(l => l.id).join('_');
    const cached     = CACHE.get(cacheKey);

    if (cached && Date.now() - cached.ts < TTL) {
      const relevant = cached.data
        .filter(m => teamMatches(m.home, teams) || teamMatches(m.away, teams))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 6);
      setMatches(relevant);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(toFetch.map(l => fetchLeague(l.id).catch(() => [])))
      .then(results => {
        if (cancelled) return;
        const all = results.flat();
        CACHE.set(cacheKey, { data: all, ts: Date.now() });
        const relevant = all
          .filter(m => teamMatches(m.home, teams) || teamMatches(m.away, teams))
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 6);
        setMatches(relevant);
        setLoading(false);
      })
      .catch(err => { if (!cancelled) { setError(String(err)); setLoading(false); } });

    return () => { cancelled = true; };
  }, [teams.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return { matches, loading, error };
}
