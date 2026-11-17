import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { DataCapability } from './DataCapability.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

export default function Leaderboard() {
  const loadLeaderboard = useCallback(
    () => getJson<Record<string, LeaderboardEntry[]>>('/api/leaderboard'),
    [],
  );

  return (
    <DataCapability<LeaderboardEntry>
      loadData={loadLeaderboard}
      title="Leaderboard"
      description="Compare team point totals."
      collection="leaderboard"
      emptyMessage="No leaderboard rankings yet."
      renderItems={(entries) => (
        <ol className="list-group list-group-numbered">
          {entries.map((entry) => (
            <li className="list-group-item" key={entry.rank}>
              <strong>{entry.teamName}</strong> — {entry.totalPoints} points
            </li>
          ))}
        </ol>
      )}
    />
  );
}
