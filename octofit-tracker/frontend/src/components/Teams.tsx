import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { DataCapability } from './DataCapability.js';

type Team = {
  _id?: string;
  name: string;
  mascot: string;
  members: string[];
};

export default function Teams() {
  const loadTeams = useCallback(
    () => getJson<Record<string, Team[]>>('/api/teams'),
    [],
  );

  return (
    <DataCapability<Team>
      loadData={loadTeams}
      title="Teams"
      description="Manage teams and members."
      collection="teams"
      emptyMessage="No teams yet."
      renderItems={(teams) => (
        <ul className="list-group list-group-flush">
          {teams.map((team, index) => (
            <li className="list-group-item" key={team._id ?? `${team.name}-${index}`}>
              <strong>{team.name}</strong> — Mascot: {team.mascot}
              <div>Members: {team.members.length ? team.members.join(', ') : 'None yet'}</div>
            </li>
          ))}
        </ul>
      )}
    />
  );
}
