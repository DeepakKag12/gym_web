import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IndianRupee, ShoppingBag, UserSquare2, RefreshCw, AlertTriangle, Search, TrendingUp,
} from 'lucide-react';

import { cachedGet, freshGet, bustCache, apiError } from '../../utils/api';
import AdminLayout from './AdminLayout';
import {
  Card, Button, Badge, Avatar, Input, EmptyState, SkeletonList, Table, TableRow,
  Tabs, FadeIn, Stagger, StatCard, timeAgo,
} from '../../components/ui';
import { fmtDate } from '../../utils/membership';

/**
 * Payments — money in, split by where it came from.
 *
 * Membership fees and shop orders are different businesses: one is recurring
 * and tied to a period, the other is one-off and tied to stock. Reporting them
 * as a single "revenue" figure hid which half was actually growing, so they are
 * separated here and only added together in the headline total.
 *
 * Membership rows come from the Payment ledger, which did not exist before —
 * renewals used to overwrite the member's fee rather than record a payment, so
 * a year of renewals showed as a single month's income.
 */

const money = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const KIND = {
  'new-membership': 'Joining fee',
  renewal: 'Renewal',
  order: 'Shop order',
  adjustment: 'Adjustment',
};

export default function AdminPayments() {
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ membership: 0, store: 0, all: 0 });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback((force = false) => {
    setLoading(true);
    setError(null);
    const get = force ? freshGet : cachedGet;
    Promise.all([
      get('/payments', { cache: 60 }),
      get('/payments/summary', { cache: 60 }),
    ])
      .then(([p, s]) => {
        setRows(p.data?.payments || []);
        setTotals(p.data?.totals || { membership: 0, store: 0, all: 0 });
        setSummary(s.data || null);
      })
      .catch(err => setError(apiError(err, 'Could not load payments.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = () => { bustCache('/payments'); bustCache('analytics'); load(true); };

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (source !== 'all' && r.source !== source) return false;
      if (!q) return true;
      return r.member?.name?.toLowerCase().includes(q)
        || r.member?.phone?.includes(q)
        || String(r.amount).includes(q);
    });
  }, [rows, source, search]);

  const shownTotal = useMemo(() => shown.reduce((n, r) => n + (r.amount || 0), 0), [shown]);

  const columns = [
    { key: 'member', label: 'Member' },
    { key: 'source', label: 'From', width: 130 },
    { key: 'kind', label: 'Reason', width: 130 },
    { key: 'date', label: 'Date', width: 150 },
    { key: 'amount', label: 'Amount', width: 120, align: 'right' },
  ];

  // Last six months, so a bar chart is unnecessary to see the trend.
  const recentMonths = useMemo(() => (summary?.series || []).slice(-6), [summary]);
  const peak = Math.max(1, ...recentMonths.map(m => m.total));

  return (
    <AdminLayout
      title="Payments"
      subtitle="Membership fees and shop orders, kept apart"
      actions={<Button icon={RefreshCw} onClick={refresh} disabled={loading}>Refresh</Button>}
    >
      {error ? (
        <Card>
          <EmptyState icon={AlertTriangle} title="Could not load payments" hint={error}>
            <Button variant="primary" icon={RefreshCw} onClick={() => load(true)}>Try again</Button>
          </EmptyState>
        </Card>
      ) : (
        <div className="space-y-4 max-w-5xl">
          <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard label="Membership fees" value={money(totals.membership)}
              hint="Joining fees and renewals" icon={UserSquare2} tone="accent" loading={loading} />
            <StatCard label="Shop orders" value={money(totals.store)}
              hint="Paid orders only" icon={ShoppingBag} tone="info" loading={loading} />
            <StatCard label="Total taken" value={money(totals.all)}
              hint="Both sources together" icon={IndianRupee} tone="ok" loading={loading} />
          </Stagger>

          {summary?.thisMonth && (
            <FadeIn delay={0.05}>
              <Card title="This month">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-[12.5px]" style={{ color: 'var(--p-text-2)' }}>Membership</p>
                    <p className="text-[22px] font-bold" style={{ color: 'var(--p-text)' }}>{money(summary.thisMonth.membership)}</p>
                  </div>
                  <div>
                    <p className="text-[12.5px]" style={{ color: 'var(--p-text-2)' }}>Shop</p>
                    <p className="text-[22px] font-bold" style={{ color: 'var(--p-text)' }}>{money(summary.thisMonth.store)}</p>
                  </div>
                  <div>
                    <p className="text-[12.5px]" style={{ color: 'var(--p-text-2)' }}>Together</p>
                    <p className="text-[22px] font-bold" style={{ color: 'var(--p-accent)' }}>{money(summary.thisMonth.all)}</p>
                  </div>
                </div>

                {recentMonths.length > 1 && (
                  <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--p-border)' }}>
                    <p className="ui-section-label mb-3">Last {recentMonths.length} months</p>
                    <div className="flex items-end gap-2" style={{ height: 90 }}>
                      {recentMonths.map(m => (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                          {/* Two stacked segments, so the split stays visible
                              rather than being flattened into one bar. */}
                          <div className="w-full flex flex-col justify-end" style={{ height: 64 }}
                            title={`${m.month}: membership ${money(m.membership)}, shop ${money(m.store)}`}>
                            <div style={{ height: `${(m.store / peak) * 100}%`, background: 'var(--p-info)', borderRadius: '3px 3px 0 0' }} />
                            <div style={{ height: `${(m.membership / peak) * 100}%`, background: 'var(--p-accent)' }} />
                          </div>
                          <span className="text-[11px]" style={{ color: 'var(--p-muted)' }}>
                            {m.month.slice(5)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-3 text-[12px]" style={{ color: 'var(--p-text-2)' }}>
                      <span className="flex items-center gap-1.5">
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--p-accent)' }} /> Membership
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--p-info)' }} /> Shop
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </FadeIn>
          )}

          <div className="ui-toolbar">
            <div className="ui-search">
              <Search size={18} />
              <Input placeholder="Search by member or amount" value={search}
                onChange={e => setSearch(e.target.value)} aria-label="Search payments" />
            </div>
          </div>

          <Tabs
            value={source}
            onChange={setSource}
            options={[
              { value: 'all', label: 'Everything', count: rows.length },
              { value: 'membership', label: 'Membership', count: rows.filter(r => r.source === 'membership').length },
              { value: 'store', label: 'Shop', count: rows.filter(r => r.source === 'store').length },
            ]}
          />

          {loading ? (
            <SkeletonList rows={6} h={56} />
          ) : shown.length === 0 ? (
            <Card>
              <EmptyState
                icon={IndianRupee}
                title={rows.length === 0 ? 'No payments recorded yet' : 'Nothing matches'}
                hint={rows.length === 0
                  ? 'Membership fees are recorded when you add or renew a member. Shop payments appear when an order is marked paid.'
                  : 'Try another search or source.'}
              />
            </Card>
          ) : (
            <FadeIn>
              <Card padded={false} className="hidden md:block">
                <Table columns={columns}>
                  {shown.map(r => (
                    <TableRow key={r._id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.member?.name} size={30} />
                          <span className="min-w-0">
                            <span className="block font-semibold" style={{ color: 'var(--p-text)' }}>
                              {r.member?.name || 'Unknown'}
                            </span>
                            <span className="block text-[12px]" style={{ color: 'var(--p-muted)' }}>
                              {r.member?.phone || '—'}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge tone={r.source === 'membership' ? 'accent' : 'info'}>
                          {r.source === 'membership' ? 'Membership' : 'Shop'}
                        </Badge>
                      </td>
                      <td>{KIND[r.kind] || r.kind}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {fmtDate(r.createdAt)}
                        <span className="block text-[11.5px]" style={{ color: 'var(--p-muted)' }}>
                          {timeAgo(r.createdAt)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: 'var(--p-text)' }}>{money(r.amount)}</strong>
                      </td>
                    </TableRow>
                  ))}
                </Table>
              </Card>

              <Card padded={false} className="md:hidden">
                <ul>
                  {shown.map((r, i) => (
                    <li key={r._id} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderTop: i ? '1px solid var(--p-border)' : 'none' }}>
                      <Avatar name={r.member?.name} size={34} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14.5px] font-semibold truncate" style={{ color: 'var(--p-text)' }}>
                          {r.member?.name || 'Unknown'}
                        </span>
                        <span className="block text-[12px]" style={{ color: 'var(--p-muted)' }}>
                          {KIND[r.kind] || r.kind} · {fmtDate(r.createdAt)}
                        </span>
                      </span>
                      <span className="text-right">
                        <strong className="block" style={{ color: 'var(--p-text)' }}>{money(r.amount)}</strong>
                        <Badge tone={r.source === 'membership' ? 'accent' : 'info'}>
                          {r.source === 'membership' ? 'Membership' : 'Shop'}
                        </Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <p className="text-[13px] text-center mt-4" style={{ color: 'var(--p-muted)' }}>
                <TrendingUp size={13} className="inline mr-1" />
                {shown.length} payment{shown.length === 1 ? '' : 's'} shown · {money(shownTotal)}
              </p>
            </FadeIn>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
