import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { DataCapability } from './DataCapability.js';

type Activity = {
  _id?: string;
  type: string;
  minutes: number;
  points: number;
};

export default function Activities() {
  const loadActivities = useCallback(
    () => getJson<Record<string, Activity[]>>('/api/activities'),
    [],
  );

  return (
    <DataCapability<Activity>
      loadData={loadActivities}
      title="Activities"
      description="Track student activity minutes and points."
      collection="activities"
      emptyMessage="No activities yet."
      renderItems={(activities) => (
        <ul className="list-group list-group-flush">
          {activities.map((activity, index) => (
            <li className="list-group-item" key={activity._id ?? `${activity.type}-${index}`}>
              <strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points
            </li>
          ))}
        </ul>
      )}
    />
  );
}
