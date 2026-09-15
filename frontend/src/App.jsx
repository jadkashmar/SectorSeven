import { TooltipProvider } from '@/components/ui/tooltip';
import RedesignApp from '@/redesign/RedesignApp';

// The "Timing Tower" redesign is now the main site. RedesignApp owns its
// own <Routes> (home, live, races, race weekend, session results,
// standings, and a catch-all 404), so it's mounted directly here as the
// whole app.
function App() {
  return (
    <TooltipProvider>
      <RedesignApp />
    </TooltipProvider>
  );
}

export default App;
