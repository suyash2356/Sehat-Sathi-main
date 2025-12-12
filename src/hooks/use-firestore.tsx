
'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, DocumentData, Query, DocumentReference, CollectionReference, QuerySnapshot, DocumentSnapshot } from 'firebase/firestore';

interface UseCollectionOptions {
  listen?: boolean;
}

export function useCollection<T>(
  query: Query | CollectionReference | null,
  options: UseCollectionOptions = { listen: true }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const memoizedQuery = useMemo(() => query, [query?.path, query?.type]);

  useEffect(() => {
    if (!memoizedQuery) {
      setLoading(false);
      setData(null);
      return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(memoizedQuery, 
      (snapshot: QuerySnapshot<DocumentData>) => {
        const result: T[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as T));
        setData(result);
        setLoading(false);
      },
      (err: Error) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, loading, error };
}


export function useDoc<T>(
  ref: DocumentReference | null,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const memoizedRef = useMemo(() => ref, [ref?.path]);

  useEffect(() => {
    if (!memoizedRef) {
        setLoading(false);
        setData(null);
        return;
    };

    setLoading(true);

    const unsubscribe = onSnapshot(memoizedRef,
      (doc: DocumentSnapshot<DocumentData>) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err: Error) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedRef]);

  return { data, loading, error };
}
