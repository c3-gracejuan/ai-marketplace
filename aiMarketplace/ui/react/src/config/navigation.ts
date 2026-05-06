/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import { Home, BookOpen, Zap, Users, Plus, ShieldCheck } from 'lucide-react';

import { NavigationItem } from '@/types/navigation';

export const navigationConfig: NavigationItem[] = [
  {
    id: 'home',
    path: '/',
    icon: Home,
    iconActive: Home,
    label: 'Home',
    tooltip: 'SWAT Marketplace',
  },
  {
    id: 'solutions',
    path: '/solutions',
    icon: BookOpen,
    iconActive: BookOpen,
    label: 'Catalog',
    tooltip: 'Browse Solutions',
  },
  {
    id: 'requests',
    path: '/requests',
    icon: Zap,
    iconActive: Zap,
    label: 'Requests',
    tooltip: 'Track Requests',
  },
  {
    id: 'team',
    path: '/team',
    icon: Users,
    iconActive: Users,
    label: 'Team',
    tooltip: 'The SWAT Team',
  },
  {
    id: 'submit',
    path: '/submit',
    icon: Plus,
    iconActive: Plus,
    label: 'Submit',
    tooltip: 'Submit a Request',
  },
  {
    id: 'admin',
    path: '/admin',
    icon: ShieldCheck,
    iconActive: ShieldCheck,
    label: 'Admin',
    tooltip: 'Admin Triage (SWAT only)',
  },
];
