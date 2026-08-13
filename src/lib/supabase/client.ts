export function getSupabaseBrowserClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aixecdfdebdbyxctdquc.supabase.co";
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpeGVjZGZkZWJkYnl4Y3RkcXVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTc1MzE5MSwiZXhwIjoyMTAxMzI5MTkxfQ.6kY5bEATRXNW_dosP9xK6Nsq2DK1KvNalwFh85HJ668";

  return {
    auth: {
      async getUser() {
        return { data: { user: null }, error: null };
      },
      async signOut() {
        return { error: null };
      },
      async updateUser(_attributes: any) {
        return { data: { user: null }, error: null };
      },
      async signInWithPassword(_credentials: any) {
        return { data: { user: null, session: null }, error: null };
      },
    },
    from(table: string) {
      return {
        select(query: string = "*") {
          const promise = (async () => {
            try {
              const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(query)}`, {
                headers: {
                  apikey: SUPABASE_KEY,
                  Authorization: `Bearer ${SUPABASE_KEY}`,
                },
              });
              if (!res.ok) return { data: null, error: await res.text() };
              const data = await res.json();
              return { data, error: null };
            } catch (err: any) {
              return { data: null, error: err.message };
            }
          })();

          return Object.assign(promise, {
            eq(column: string, value: any) {
              const eqPromise = (async () => {
                try {
                  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`, {
                    headers: {
                      apikey: SUPABASE_KEY,
                      Authorization: `Bearer ${SUPABASE_KEY}`,
                    },
                  });
                  if (!res.ok) return { data: null, error: await res.text() };
                  const data = await res.json();
                  return { data, error: null };
                } catch (err: any) {
                  return { data: null, error: err.message };
                }
              })();
              return Object.assign(eqPromise, {
                async maybeSingle() {
                  const res = await eqPromise;
                  if (res.data && Array.isArray(res.data)) {
                    return { data: res.data[0] || null, error: res.error };
                  }
                  return res;
                },
                async single() {
                  const res = await eqPromise;
                  if (res.data && Array.isArray(res.data)) {
                    return { data: res.data[0] || null, error: res.error };
                  }
                  return res;
                },
              });
            },
          });
        },
        async upsert(data: any, _options?: any) {
          try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
              method: "POST",
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                Prefer: "resolution=merge-duplicates",
              },
              body: JSON.stringify(data),
            });
            if (!res.ok) return { data: null, error: await res.text() };
            const result = await res.json();
            return { data: result, error: null };
          } catch (err: any) {
            return { data: null, error: err.message };
          }
        },
      };
    },
  };
}
