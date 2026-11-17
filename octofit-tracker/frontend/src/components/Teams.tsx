import { getJson } from '../api/client.js';
import { DataCapability } from './DataCapability.js';

type Team = {
  _id?: string;
  name: string;
  mascot: string;
  members: string[];
};

export default function Teams() {
  return (
    <DataCapability<Team>
      getJson={getJson}
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
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
