import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkers on Stacks',
  description: 'Decentralized Checkers/Draughts Game on Stacks Blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
