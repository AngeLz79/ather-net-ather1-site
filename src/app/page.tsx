'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from '@/components/ui/stats/dashboard'

const queryClient = new QueryClient()

export default function StatsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}