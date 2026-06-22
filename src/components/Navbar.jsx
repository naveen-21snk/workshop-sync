import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, UserPlus, Users, Eclipse } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Register Form", path: "/register", icon: UserPlus },
    { name: "Participants list", path: "/participants", icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-blue-600 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
                <Eclipse className="w-5 h-5 animate-spin-slow" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                Workshop<span className="text-blue-600">Sync</span>
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="flex space-x-2 sm:space-x-4 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  id={`nav-link-${item.name.toLowerCase().replace(" ", "-")}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-blue-50 text-blue-700 shadow-xs border border-blue-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
