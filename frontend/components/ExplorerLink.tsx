'use client';

import { EXPLORER_URL } from '@/constants';

interface ExplorerLinkProps {
  txId?: string;
  address?: string;
  label?: string;
}

export default function ExplorerLink({ txId, address, label }: ExplorerLinkProps) {
  const path = txId
    ? `/txid/${txId}?chain=mainnet`
    : `/address/${address}?chain=mainnet`;

  return (
    <a
      href={`${EXPLORER_URL}${path}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-purple-400 hover:text-purple-300 text-xs underline underline-offset-2 transition-colors"
    >
      {label ?? (txId ? 'View tx ↗' : 'View on Explorer ↗')}
    </a>
  );
}
