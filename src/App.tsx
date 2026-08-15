import { useState } from 'react';
import { AppProvider, useApp } from '@/lib/AppContext';
import { Sidebar, TopBar } from '@/components/Sidebar';
import { LiveTicker } from '@/components/LiveTicker';
import { HomePage } from '@/pages/HomePage';
import { MonitorPage } from '@/pages/MonitorPage';
import { PredictionPage } from '@/pages/PredictionPage';
import { SignalsPage } from '@/pages/SignalsPage';
import { EmergencyPage } from '@/pages/EmergencyPage';
import { AccidentPage } from '@/pages/AccidentPage';
import { SoundPage } from '@/pages/SoundPage';
import { RoadPage } from '@/pages/RoadPage';
import { ViolationPage } from '@/pages/ViolationPage';
import { ParkingPage } from '@/pages/ParkingPage';
import { TransportPage } from '@/pages/TransportPage';
import { CitizenPage } from '@/pages/CitizenPage';
import { FlowBotPage } from '@/pages/FlowBotPage';
import { EcoPage } from '@/pages/EcoPage';
import { AdminPage } from '@/pages/AdminPage';
import { SimulationPage } from '@/pages/SimulationPage';

function Shell() {
  const { page } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pages: Record<string, React.ReactNode> = {
    home: <HomePage />,
    monitor: <MonitorPage />,
    prediction: <PredictionPage />,
    signals: <SignalsPage />,
    emergency: <EmergencyPage />,
    accident: <AccidentPage />,
    sound: <SoundPage />,
    road: <RoadPage />,
    violation: <ViolationPage />,
    parking: <ParkingPage />,
    transport: <TransportPage />,
    citizen: <CitizenPage />,
    flowbot: <FlowBotPage />,
    eco: <EcoPage />,
    admin: <AdminPage />,
    simulation: <SimulationPage />,
  };

  return (
    <div className="cc-bg min-h-screen text-slate-200">
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <TopBar onMenu={() => setSidebarOpen(true)} />
          <LiveTicker />
          <main className="flex-1 px-4 lg:px-6 py-6 page-enter" key={page}>
            <div className="max-w-[1600px] mx-auto">{pages[page]}</div>
          </main>
          <footer className="px-4 lg:px-6 py-4 text-center text-xs text-slate-500 border-t border-cyan-400/5">
            FlowGuard AI · Smart City Traffic Command Center · {new Date().getFullYear()}
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
