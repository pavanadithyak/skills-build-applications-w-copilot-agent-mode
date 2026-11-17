import { DataCapability } from './DataCapability.js';

type WorkoutSuggestion = {
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason?: string;
};

const userEmail = 'mona@example.com';

export default function Workouts() {
  return (
    <DataCapability<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint={`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`}
      collection="suggestions"
      emptyMessage="No workout suggestions yet."
      renderItems={(suggestions) => (
        <ul className="list-group list-group-flush">
          {suggestions.map((suggestion, index) => (
            <li className="list-group-item" key={`${suggestion.title}-${index}`}>
              <strong>{suggestion.title}</strong>
              {suggestion.focus && <div>Focus: {suggestion.focus}</div>}
              {suggestion.minutes !== undefined && <div>{suggestion.minutes} minutes ({suggestion.difficulty})</div>}
              {suggestion.reason && <div>{suggestion.reason}</div>}
            </li>
          ))}
        </ul>
      )}
    />
  );
}
