'use client';

import { useState, useEffect } from 'react';
import { AppConfig, UserSession } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export function useStacks() {
  const [userData, setUserData] = useState<any>(null);

  return {
    userData,
    userSession,
  };
}
