/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import SolutionCard from '@/components/marketplace/SolutionCard';
import { CardGridSkeleton } from '@/components/marketplace/CardGridSkeleton';
import { featuredSolutions, recentlyShipped as recentlyShippedApi, landingStats } from '@/api/marketplace';
import { Solution, MarketplaceStats } from '@/types/marketplace';

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
  const [featured, setFeatured] = useState<Solution[]>([]);
  const [recent, setRecent] = useState<Solution[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [stats, setStats] = useState<MarketplaceStats>({
    requestsFielded: 0,
    solutionsInProgress: 0,
    solutionsShipped: 0,
    engineerHoursSaved: 0,
    companyDollarsSaved: 0,
  });

  useEffect(() => {
    featuredSolutions(3).then(setFeatured).catch(() => {}).finally(() => setLoadingFeatured(false));
    recentlyShippedApi(4).then(setRecent).catch(() => {}).finally(() => setLoadingRecent(false));
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
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 divide-x-0 md:divide-x divide-weak">
          <StatCounter target={stats.requestsFielded} label="Requests fielded" />
          <StatCounter target={stats.solutionsInProgress} label="Solutions in progress" />
          <StatCounter target={stats.solutionsShipped} label="Solutions shipped" />
          <StatCounter target={stats.engineerHoursSaved} label="Engineer hours saved" suffix="+" />
          <StatCounter target={stats.companyDollarsSaved} label="Dollars saved" prefix="$" />
        </div>
      </section>

      {/* Featured solutions */}
      <section className="px-6 py-14 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">Featured Solutions</h2>
            <p className="text-secondary text-sm mt-1">Our highest-impact recent work.</p>
          </div>
          <button
            onClick={() => navigate('/solutions')}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {loadingFeatured ? (
          <CardGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map((s) => (
              <SolutionCard key={s.id} solution={s} />
            ))}
          </div>
        )}
      </section>

      {/* Recently shipped */}
      <section className="bg-secondary px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary">Recently Shipped</h2>
              <p className="text-secondary text-sm mt-1">Hot off the press.</p>
            </div>
            <button
              onClick={() => navigate('/solutions')}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Full catalog <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {loadingRecent ? (
            <CardGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recent.map((s) => (
                <SolutionCard key={s.id} solution={s} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About strip */}
      <section className="px-6 py-14 max-w-4xl mx-auto text-center">
        <h2 className="text-xl font-bold text-primary mb-3">About SWAT</h2>
        <p className="text-secondary leading-relaxed mb-6">
          The SWAT team is a small, high-output engineering unit embedded within C3 AI. We tackle the internal automation problems that compound the most — FP&A bottlenecks, Sales Ops friction, CS tooling gaps, and cross-functional data plumbing. We triage every request, work in public, and credit every engineer by name.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/team')}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Meet the team
          </button>
          <span className="text-secondary">·</span>
          <button
            onClick={() => navigate('/projects')}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            See in-flight projects
          </button>
        </div>
      </section>
    </div>
  );
}
