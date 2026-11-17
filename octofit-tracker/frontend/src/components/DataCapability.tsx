import { useEffect, useState, type ReactNode } from 'react';

type State<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; items: T[] };

type Props<T> = {
  loadData: () => Promise<Record<string, T[]>>;
  title: string;
  description: string;
  collection: string;
  emptyMessage: string;
  renderItems: (items: T[]) => ReactNode;
};

export function DataCapability<T>({
  loadData,
  title,
  description,
  collection,
  emptyMessage,
  renderItems,
}: Props<T>) {
  const [state, setState] = useState<State<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    loadData()
      .then((response) => {
        const items = response[collection];
        if (!Array.isArray(items)) throw new Error('Unexpected API response.');
        if (active) setState({ status: 'loaded', items });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const detail = error instanceof Error ? error.message : 'Request failed.';
        setState({ status: 'error', message: `Unable to load ${title.toLowerCase()}: ${detail}` });
      });

    return () => {
      active = false;
    };
  }, [collection, loadData, title]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">{state.message}</p>}
        {state.status === 'loaded' && (state.items.length === 0
          ? <p>{emptyMessage}</p>
          : renderItems(state.items))}
      </div>
    </section>
  );
}
