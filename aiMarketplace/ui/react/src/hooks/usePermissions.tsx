/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUserPermissions } from '@/api/marketplace';

interface PermissionsState {
  isAdmin: boolean;
  roles: string[];
  loading: boolean;
}

const DEFAULT_STATE: PermissionsState = { isAdmin: false, roles: [], loading: true };

const PermissionsContext = createContext<PermissionsState>(DEFAULT_STATE);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PermissionsState>(DEFAULT_STATE);

  useEffect(() => {
    let cancelled = false;
    getCurrentUserPermissions()
      .then((perms) => {
        if (cancelled) return;
        setState({ isAdmin: perms.isAdmin, roles: perms.roles, loading: false });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ isAdmin: false, roles: [], loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <PermissionsContext.Provider value={state}>{children}</PermissionsContext.Provider>;
}

export function usePermissions(): PermissionsState {
  return useContext(PermissionsContext);
}
