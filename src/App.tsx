import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionContext, useSessionProvider } from './lib/useSession';
import { HostPanel } from './pages/HostPanel';
import { BroadcastViewWrapper } from './pages/BroadcastView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 2,
    },
  },
});

function SessionProvider({ children }: { children: React.ReactNode }) {
  const session = useSessionProvider();

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/host" replace />} />
            <Route path="/host" element={<HostPanel />} />
            <Route path="/broadcast" element={<BroadcastViewWrapper />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default App;
