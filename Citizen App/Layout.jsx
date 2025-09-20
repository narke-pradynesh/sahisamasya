import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/src/utils";
import { User } from "@/src/entities/User";
import LoginForm from "./src/components/auth/LoginForm";
import RegisterForm from "./src/components/auth/RegisterForm";
import { 
    Home, 
    Plus, 
    Settings, 
    Users, 
    LogOut,
    MapPin,
    Shield,
    Bell
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/src/components/ui/sidebar";
import { Button } from "@/src/components/ui/button";

const citizenNavigation = [
  {
    title: "Community Feed",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Report Issue",
    url: createPageUrl("ReportIssue"),
    icon: Plus,
  }
];

const adminNavigation = [
  {
    title: "Admin Dashboard",
    url: createPageUrl("AdminDashboard"),
    icon: Shield,
  },
  {
    title: "All Complaints",
    url: createPageUrl("AdminComplaints"),
    icon: Settings,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showLogin, setShowLogin] = React.useState(true);
  const [showRegister, setShowRegister] = React.useState(false);

  React.useEffect(() => {
    loadUser();
  }, []);

  React.useEffect(() => {
    const handleOpenLogin = () => {
      setShowRegister(false);
      setShowLogin(true);
    };
    window.addEventListener('open-login', handleOpenLogin);
    return () => {
      window.removeEventListener('open-login', handleOpenLogin);
    };
  }, []);

  const loadUser = async () => {
    try {
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Load timeout')), 5000); // 5 second timeout
      });
      
      const userPromise = User.me();
      const currentUser = await Promise.race([userPromise, timeoutPromise]);
      setUser(currentUser);
    } catch (error) {
      console.warn('User loading failed:', error);
      setUser(null);
    }
    setLoading(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogout = async () => {
    await User.logout();
    setUser(null);
  };

  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const isAdmin = user?.role === 'admin';
  const navigationItems = isAdmin ? adminNavigation : citizenNavigation;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
          <div className="text-gray-600">Loading SahiSamasya...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 sm:p-6 safe-area-top safe-area-bottom">
        <div className="w-full max-w-sm sm:max-w-md">
          {showLogin ? (
            <LoginForm 
              onLogin={handleLogin}
              onSwitchToRegister={switchToRegister}
            />
          ) : showRegister ? (
            <RegisterForm 
              onRegister={handleRegister}
              onSwitchToLogin={switchToLogin}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">SahiSamasya</h1>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Connect with your community. Report issues. Make a difference.</p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setShowLogin(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 text-base sm:text-lg touch-spacing-sm"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => setShowRegister(true)}
                  variant="outline"
                  className="w-full py-3 text-base sm:text-lg touch-spacing-sm"
                >
                  Create Account
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-4">Join thousands of citizens making their communities better</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-blue-50 safe-area-top safe-area-bottom">
        <Sidebar className="border-r border-gray-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900 text-sm sm:text-base truncate">SahiSamasya</h2>
                <p className="text-xs text-gray-500 truncate">{isAdmin ? 'Admin Portal' : 'Community Platform'}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 rounded-xl ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 border-blue-200' : ''
                        }`}
                      >
                        <Link 
                          to={item.url} 
                          className="flex items-center gap-3 px-3 py-3 sm:px-4 touch-spacing-sm"
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {!isAdmin && (
              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Quick Stats
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-3 sm:px-4 space-y-3">
                    <div className="flex items-center gap-3 text-xs sm:text-sm">
                      <Bell className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-gray-600 truncate">Active Issues</span>
                      <span className="ml-auto font-bold text-amber-600">12</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm">
                      <Users className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 truncate">Community</span>
                      <span className="ml-auto font-bold text-green-600">2.4k</span>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-xs sm:text-sm">{user.full_name?.[0] || 'U'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{user.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{isAdmin ? 'Administrator' : 'Citizen'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 touch-spacing-sm"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/60 backdrop-blur-sm border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 md:hidden safe-area-top">
            <div className="flex items-center gap-3 sm:gap-4">
              <SidebarTrigger className="hover:bg-gray-100 rounded-lg transition-colors duration-200" />
              <h1 className="text-lg sm:text-xl font-bold truncate">SahiSamasya</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="min-h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}