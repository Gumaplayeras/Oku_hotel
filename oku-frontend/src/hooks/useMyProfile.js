import { useEffect, useState } from 'react';
import { getMyProfile } from '../api/user';

export default function useMyProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await getMyProfile();
        if (!abort) setData(res);
      } catch (e) {
        if (!abort) setError(e);
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, []);

  return { data, loading, error };
}