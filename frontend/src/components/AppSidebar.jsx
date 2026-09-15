import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/live', label: 'Live' },
  { to: '/races', label: 'Races' },
  { to: '/standings', label: 'Standings' },
];

function AppSidebar() {
  return (
    <Sidebar className="!bg-[#050505] border-r border-white/5">
      {/* 
        Custom Red Header
        Built with standard divs to avoid missing Shadcn header components
      */}
      <div className="w-full bg-red-600 border-b border-red-700 shadow-md p-6">
        <Link to="/" className="block w-full hover:scale-[1.02] transition-transform origin-left">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-sm">
            Sector <span className="text-black">Seven</span>
          </h2>
        </Link>
      </div>

      <SidebarContent className="!bg-[#050505] pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 px-4">
            Menu
          </SidebarGroupLabel>
          
          <SidebarMenu className="px-3 gap-2">
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.to}>
                <SidebarMenuButton 
                  asChild 
                  className="w-full !text-zinc-400 hover:!text-white hover:!bg-white/10 transition-all duration-300 group rounded-lg py-5 px-4 h-auto"
                >
                  <Link to={link.to} className="flex items-center relative w-full overflow-hidden">
                    {/* Telemetry Accent Line */}
                    <div className="absolute left-0 w-1 h-0 bg-red-600 rounded-r-full group-hover:h-3/4 transition-all duration-300 ease-out" />
                    
                    <span className="font-medium text-[15px] tracking-wide transform group-hover:translate-x-3 transition-transform duration-300 ease-out">
                      {link.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;