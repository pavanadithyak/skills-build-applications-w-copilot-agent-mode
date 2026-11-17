import { useCallback } from 'react';
import { getJson } from '../api/client.js';
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
  const loadSuggestions = useCallback(
    () => getJson<Record<string, WorkoutSuggestion[]>>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`),
    [],
  );

  return (
    <DataCapability<WorkoutSuggestion>
      loadData={loadSuggestions}
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
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
