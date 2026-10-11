import { useEffect, useState } from 'react';

type ReviewItem = { id: string; status: string; reason?: string; plan?: string; amount?: number; createdAt: string };

async function load<T>(path: string): Promise<T[]> {
  const response = await fetch(path, { credentials: 'include' });
  if (!response.ok) throw new Error('Admin access required.');
  const payload = await response.json() as { data?: T[] };
  return payload.data ?? [];
}

export default function AdminReviewPanel({ darkMode = false }: { darkMode?: boolean }) {
  const [reports, setReports] = useState<ReviewItem[]>([]);
  const [boostOrders, setBoostOrders] = useState<ReviewItem[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    void Promise.all([load<ReviewItem>('/api/marketplace/admin/reports'), load<ReviewItem>('/api/marketplace/admin/boost-orders')])
      .then(([nextReports, nextOrders]) => { setReports(nextReports); setBoostOrders(nextOrders); })
      .catch((reason: Error) => setError(reason.message));
  }, []);
  const review = async (path: string, id: string, status: string) => {
    await fetch(path, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    if (path.includes('reports')) setReports((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    else setBoostOrders((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  };
  return <section className={`rounded-2xl border p-5 ${darkMode ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-900'}`} aria-labelledby="admin-review-title">
    <h2 id="admin-review-title" className="text-lg font-semibold">Admin review queue</h2>
    {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : <div className="mt-4 grid gap-5 md:grid-cols-2">
      <div><h3 className="font-medium">Reports ({reports.length})</h3>{reports.map((item) => <div key={item.id} className="mt-2 rounded-xl border p-3 text-sm"><div>{item.reason}</div><div className="mt-2 flex gap-2"><button className="rounded-lg bg-emerald-600 px-3 py-1 text-white" onClick={() => void review('/api/marketplace/admin/reports/review', item.id, 'resolved')}>Resolve</button><button className="rounded-lg bg-red-600 px-3 py-1 text-white" onClick={() => void review('/api/marketplace/admin/reports/review', item.id, 'rejected')}>Reject</button></div></div>)}</div>
      <div><h3 className="font-medium">Boost payments ({boostOrders.length})</h3>{boostOrders.map((item) => <div key={item.id} className="mt-2 rounded-xl border p-3 text-sm"><div>{item.plan} · {item.amount?.toLocaleString()} UGX</div><div className="mt-2 flex gap-2"><button className="rounded-lg bg-emerald-600 px-3 py-1 text-white" onClick={() => void review('/api/marketplace/admin/boost-orders/review', item.id, 'approved')}>Approve</button><button className="rounded-lg bg-red-600 px-3 py-1 text-white" onClick={() => void review('/api/marketplace/admin/boost-orders/review', item.id, 'rejected')}>Reject</button></div></div>)}</div>
    </div>}
  </section>;
}
