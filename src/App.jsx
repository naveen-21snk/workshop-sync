import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Participants from "./pages/Participants";
import { AlertCircle } from "lucide-react";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-900 font-sans antialiased">
        {/* Persistent Desktop/Mobile Navigation */}
        <Navbar />

        {/* Global Router-driven Workspace Content */}
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/participants" element={<Participants />} />
            
            {/* Fallback 404 handler block */}
            <Route
              path="*"
              element={
                <div id="404-fallback-card" className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto min-h-[60vh]">
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl mb-4">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
                    Page Not Found
                  </h1>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                    The requested administrator console screen does not exist or has been relocated of the grid.
                  </p>
                  <Link
                    to="/"
                    className="mt-5 inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
