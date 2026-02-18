'use client';

import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export function useStacks() {
  const [userData, setUserData] = useState<any>(null);
  const [network] = useState(new StacksTestnet());

  return {
    userData,
    userSession,
    network,
  };
}
