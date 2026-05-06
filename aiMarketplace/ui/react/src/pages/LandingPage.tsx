/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { landingStats, listSolutions } from '@/api/marketplace';
import { MarketplaceStats, Solution } from '@/types/marketplace';
import { formatDollars } from '@/lib/formatImpact';

function formatRelative(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return 'last week';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return 'last month';
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function shipImpact(s: Solution): string {
  const parts: string[] = [];
  if (s.hoursSaved) parts.push(`${s.hoursSaved.toLocaleString()} hrs saved`);
  if (s.dollarsSaved) parts.push(`${formatDollars(s.dollarsSaved)} impact`);
  return parts.join(' · ');
}

function StatCounter({ target, label, prefix = '', suffix = '' }: { target: number; label: string; prefix?: string; suffix?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useAnimatedCounter(visible ? target : 0, 2000);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const formatted = count >= 1_000_000
    ? `${(count / 1_000_000).toFixed(1)}M`
    : count >= 1000
    ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`
    : count.toString();

  return (
    <div ref={ref} className="text-center">
      <p className="text-fluid-stat font-bold text-blue-600 dark:text-blue-400 tabular-nums">
        {prefix}{formatted}{suffix}
      </p>
      <p className="text-sm text-secondary mt-1">{label}</p>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<MarketplaceStats>({
    solutionsInProgress: 0,
    solutionsShipped: 0,
    engineerHoursSaved: 0,
    companyDollarsSaved: 0,
  });
  const [recentShips, setRecentShips] = useState<Solution[]>([]);
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    landingStats().then(setStats).catch(() => {});
    listSolutions()
      .then((all) => {
        const ships = all
          .filter((s) => s.status === 'Shipped' && s.dateShipped)
          .sort((a, b) => (b.dateShipped! > a.dateShipped! ? 1 : -1))
          .slice(0, 5);
        setRecentShips(ships);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (recentShips.length <= 1) return;
    const t = setInterval(() => {
      setTickerIdx((i) => (i + 1) % recentShips.length);
    }, 5000);
    return () => clearInterval(t);
  }, [recentShips.length]);

  const currentShip = recentShips[tickerIdx];

  return (
    <div className="min-h-full">
      {/* Hero — editorial, left-aligned, content-led */}
      <section className="relative bg-primary border-b border-weak px-6 md:px-12 py-fluid-hero">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary mb-3">
            SWAT Marketplace
          </p>

          <h1 className="text-fluid-display font-extrabold text-primary leading-[1.05] tracking-tight max-w-4xl">
            Got a problem that needs solving?
          </h1>

          <p className="text-fluid-lead text-secondary mt-5 max-w-2xl leading-relaxed">
            A small engineering team that builds internal tools, automates workflows, and ships real solutions for every team at C3.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6">
            <button
              onClick={() => navigate('/submit')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors"
            >
              Submit a Request
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/solutions')}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary transition-colors"
            >
              Browse the solutions catalog
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Live ticker — most-recently shipped solution, auto-rotates */}
          {currentShip && (
            <div className="mt-8 pt-5 border-t border-weak max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-green-600 dark:text-green-400 shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Just shipped
                </span>
                <span
                  key={currentShip.id}
                  className="c3-page-skeleton-enter min-w-0 text-secondary truncate"
                >
                  <button
                    onClick={() => navigate(`/solutions/${currentShip.id}`)}
                    className="font-semibold text-primary hover:underline"
                  >
                    {currentShip.title}
                  </button>
                  {shipImpact(currentShip) && <span> · {shipImpact(currentShip)}</span>}
                  {currentShip.dateShipped && <span> · {formatRelative(currentShip.dateShipped)}</span>}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-primary border-b border-weak px-6 py-fluid-strip">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 divide-x-0 md:divide-x divide-weak">
          <StatCounter target={stats.solutionsInProgress} label="Solutions in build" />
          <StatCounter target={stats.solutionsShipped} label="Solutions shipped" />
          <StatCounter target={stats.engineerHoursSaved} label="Engineer hours saved" suffix="+" />
          <StatCounter target={stats.companyDollarsSaved} label="Dollars saved" prefix="$" />
        </div>
      </section>

      {/* How we work */}
      <section className="px-6 py-fluid-section max-w-6xl mx-auto">
        <div className="bg-secondary border border-weak rounded-2xl p-fluid-card">
          <h2 className="text-xl font-bold text-primary mb-4">How we work</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Intake',
                desc: 'Anyone at C3 submits a structured request via the Marketplace. Every request gets a triage review.',
              },
              {
                step: '02',
                title: 'Triage',
                desc: 'We evaluate fit, scope, and capacity. We respond to every request — even with a "not now" — with transparent reasoning.',
              },
              {
                step: '03',
                title: 'Build',
                desc: 'Accepted projects are owned by a named engineer. Status is public. We ship iteratively and move fast.',
              },
              {
                step: '04',
                title: 'Ship & Compound',
                desc: 'Every shipped solution is documented and searchable. We tag reusable patterns so the next team can fork, not rebuild.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-2">
                <span className="text-3xl font-black text-blue-200 dark:text-blue-400/70">{step}</span>
                <h3 className="font-semibold text-primary">{title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
