import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { router } from './router'
import './design-system/tokens.css'
import './styles/base.css'
import './design-system/components.css'
import './design-system/shell.css'

/**
 * An internal desktop tool on a fast network: refetching on every window focus
 * is noise rather than freshness. Data is refreshed when a mutation invalidates
 * it, which is the case that actually matters here.
 *
 * A 401 is not worth retrying — the session is gone and the route guard will
 * send the user to sign in.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status
        if (status === 401 || status === 403 || status === 404) return false
        return failureCount < 2
      },
    },
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
