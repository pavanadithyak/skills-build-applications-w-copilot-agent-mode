import { getJson } from '../api/client.js';
import { DataCapability } from './DataCapability.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

export default function Leaderboard() {
  return (
    <DataCapability<LeaderboardEntry>
      getJson={getJson}
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
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
