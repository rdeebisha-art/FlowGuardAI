import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

/**
 * Subscribe to a table with live realtime updates.
 * Fetches the initial rows, then keeps the array in sync as rows are
 * inserted / updated / deleted by anyone across the city.
 */
export function useRealtimeTable<T extends { id: string }>(
  table: string,
  options?: { order?: string; ascending?: boolean; limit?: number },
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from(table).select('*');
    if (options?.order) q = q.order(options.order, { ascending: options.ascending ?? false });
    if (options?.limit) q = q.limit(options.limit);
    const { data, error } = await q;
    if (error) setError(error.message);
    else setRows((data as T[]) || []);
    setLoading(false);
  }, [table, options?.order, options?.ascending, options?.limit]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === 'INSERT') {
              const newRow = payload.new as T;
              return prev.some((r) => r.id === newRow.id) ? prev : [newRow, ...prev];
            }
            if (payload.eventType === 'UPDATE') {
              const updated = payload.new as T;
              return prev.map((r) => (r.id === updated.id ? updated : r));
            }
            if (payload.eventType === 'DELETE') {
              const deleted = payload.old as { id: string };
              return prev.filter((r) => r.id !== deleted.id);
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, load]);

  return { rows, loading, error, reload: load };
}

/** Live count of rows in a table, updated in realtime. */
export function useRealtimeCount(table: string) {
  const { rows } = useRealtimeTable<{ id: string }>(table, { limit: 1000 });
  return rows.length;
}
