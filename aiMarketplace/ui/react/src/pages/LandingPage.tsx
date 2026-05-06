/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { landingStats } from '@/api/marketplace';
import { MarketplaceStats } from '@/types/marketplace';

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
      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
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

  useEffect(() => {
    landingStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-900 text-white px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            C3 AI SWAT Team
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            Got a problem that needs solving?
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
            The SWAT Marketplace connects every C3 employee with the engineering team that builds internal tools, automates workflows, and ships real solutions fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/submit')}
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Submit a Request
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/solutions')}
              className="inline-flex items-center gap-2 bg-blue-500/30 text-white border border-white/30 font-medium px-6 py-3 rounded-lg hover:bg-blue-500/40 transition-colors"
            >
              Browse Solutions
            </button>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-primary border-b border-weak px-6 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 divide-x-0 md:divide-x divide-weak">
          <StatCounter target={stats.solutionsInProgress} label="Solutions in build" />
          <StatCounter target={stats.solutionsShipped} label="Solutions shipped" />
          <StatCounter target={stats.engineerHoursSaved} label="Engineer hours saved" suffix="+" />
          <StatCounter target={stats.companyDollarsSaved} label="Dollars saved" prefix="$" />
        </div>
      </section>

      {/* How we work */}
      <section className="px-6 py-14 max-w-6xl mx-auto">
        <div className="bg-secondary border border-weak rounded-2xl p-8">
          <h2 className="text-xl font-bold text-primary mb-6">How we work</h2>
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
                <span className="text-3xl font-black text-blue-200 dark:text-blue-900">{step}</span>
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
