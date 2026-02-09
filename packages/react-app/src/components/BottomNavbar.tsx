import { Home, Compass, BarChart3, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";

export default function BottomNavbar() {
  const location = useLocation();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const { disconnect } = useDisconnect();
  const appKit = useAppKit();

  const isActive = (route: string) => {
    if (route === "/") return location.pathname === "/";
    return location.pathname.startsWith(route);
  };

  const handleLogout = async () => {
    try {
      disconnect();
      setShowLogoutMenu(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/explore", icon: Compass, label: "Explore" },
    { to: "/streams", icon: BarChart3, label: "Streams" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 px-4 z-50">
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl px-2 py-2 shadow-xl border border-gray-800/50">
          <div className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive(to)
                    ? "bg-green-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            ))}

            {/* QR / Support Button (center accent) */}
            <Link
              to="/trust"
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive("/trust")
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-0.5">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-sm ${
                        i === 4 ? "bg-transparent" : "bg-current"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] font-medium">Support</span>
            </Link>

            {/* Logout */}
            <div className="relative">
              <button
                className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                  showLogoutMenu
                    ? "bg-red-600/20 text-red-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
                onClick={() => setShowLogoutMenu(!showLogoutMenu)}
              >
                <LogOut className="h-5 w-5" />
                <span className="text-[10px] font-medium">Exit</span>
              </button>

              {showLogoutMenu && (
                <div className="absolute right-0 bottom-full mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 min-w-[140px] z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left text-red-400 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      {showLogoutMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLogoutMenu(false)}
        />
      )}
    </>
  );
}
