import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  Users, 
  Award, 
  Database, 
  UserPlus, 
  ArrowRight, 
  FolderGit2, 
  Clock, 
  ExternalLink 
} from "lucide-react";
import { WORKSHOPS } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/stats");
      if (response.data.success) {
        setStats(response.data.stats);
        setDbStatus(response.data.dbStatus);
      } else {
        setError(response.data.error || "Failed to retrieve workshop statistics.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Could not connect to server. Ensure your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling metrics and dashboard states..." size="lg" />;
  }

  // Calculate percentages for workshop stats
  const totalCount = stats?.total || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="mb-8 md:flex md:items-center md:justify-between bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight">
            Workshop Management Dashboard
          </h1>
          <p className="mt-2 text-slate-400 max-w-xl text-sm md:text-base">
            Track student allocations, process instant registrations, and analyze workshop engagement real-time.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Link
            to="/register"
            id="dashboard-cta-register"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2.5 rounded-xl text-sm transition-all text-white"
          >
            <UserPlus className="w-4 h-4" />
            Register Student
          </Link>
          <Link
            to="/participants"
            id="dashboard-cta-list"
            className="inline-flex items-center gap-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 font-medium px-4 py-2.5 rounded-xl text-sm transition-all text-slate-300"
          >
            <Users className="w-4 h-4" />
            See Directory
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-sm flex gap-2 items-start">
          <span className="font-semibold">Connection Error:</span> {error}
          <button onClick={fetchStats} className="ml-auto underline text-rose-700 hover:text-rose-900 font-medium">
            Retry Connection
          </button>
        </div>
      )}

      {/* Database Integration Alert */}
      {dbStatus && (
        <div
          className={`mb-8 border rounded-2xl p-5 ${
            dbStatus.connected
              ? "bg-emerald-50/50 border-emerald-100"
              : "bg-amber-50/50 border-amber-100"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div
              className={`p-3 rounded-xl ${
                dbStatus.connected
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <Database className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-900 text-base">
                  Database Provider:{" "}
                  <span className={dbStatus.connected ? "text-emerald-700" : "text-amber-700"}>
                    {dbStatus.type}
                  </span>
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    dbStatus.connected
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800 animate-pulse"
                  }`}
                >
                  {dbStatus.connected ? "Online Atlas API" : "Active Fallback Sandbox"}
                </span>
              </div>
              <p className="mt-1.5 text-slate-600 text-sm leading-relaxed">
                {dbStatus.message}
              </p>
              {!dbStatus.connected && (
                <p className="mt-2 text-xs text-slate-500 font-mono">
                  💡 Note: To connect to MongoDB Atlas, add your <code className="bg-amber-100/70 p-0.5 rounded px-1">MONGODB_URI</code> to your deployment environments. The app is gracefully preserving registrations locally until configured!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Primary Counters Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Enrollments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total Allocations
            </p>
            <p className="mt-2 font-display font-bold text-4xl text-slate-900 tracking-tight">
              {totalCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Across all workshops
            </p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-8 h-8" />
          </div>
        </div>

        {/* Unique Workshops Offered */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Active Curriculum
            </p>
            <p className="mt-2 font-display font-bold text-4xl text-slate-900 tracking-tight">
              {WORKSHOPS.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Specialized domains
            </p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Award className="w-8 h-8" />
          </div>
        </div>

        {/* System Reference Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Verification State
            </p>
            <p className="mt-2 font-display font-bold text-2xl text-slate-900 tracking-tight lg:text-3xl">
              100% Secure
            </p>
            <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Instant Reference Codes
            </p>
          </div>
          <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl">
            <FolderGit2 className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Workshop Registration Breakup */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-8">
        <h2 className="font-display font-bold text-lg text-slate-900 tracking-tight mb-6">
          Workshop Allotment Distribution
        </h2>
        <div className="space-y-6">
          {WORKSHOPS.map((workshopName, idx) => {
            const count = stats?.workshopCounts?.[workshopName] || 0;
            const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            
            // Colors based on loop indexes
            const colors = [
              { bar: "bg-blue-600", text: "text-blue-700", bg: "bg-blue-50" },
              { bar: "bg-indigo-600", text: "text-indigo-700", bg: "bg-indigo-50" },
              { bar: "bg-purple-600", text: "text-purple-700", bg: "bg-purple-50" },
              { bar: "bg-teal-600", text: "text-teal-700", bg: "bg-teal-50" },
              { bar: "bg-cyan-600", text: "text-cyan-700", bg: "bg-cyan-50" },
            ];
            const colorScheme = colors[idx % colors.length];

            return (
              <div key={workshopName} className="border-b border-slate-100 last:border-none pb-4 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="max-w-[75%]">
                    <p className="text-sm font-semibold text-slate-900">
                      {workshopName}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Stream {idx + 1}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${colorScheme.bg} ${colorScheme.text}`}>
                      {count} {count === 1 ? "student" : "students"}
                    </span>
                    <p className="text-xs font-mono font-medium text-slate-400 mt-0.5">
                      {percentage}%
                    </p>
                  </div>
                </div>

                {/* Progress Visualizer */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${colorScheme.bar} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentage || 1}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Information Footnote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-4">
          <div className="bg-blue-150 p-2 text-blue-700 rounded-xl h-fit">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-slate-900 font-semibold text-sm">Need to export participants?</h4>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              Navigate to the roster directory. You can query specific colleges or individuals to manage seat allocation limits effortlessly.
            </p>
            <Link to="/participants" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 mt-2">
              Go to list <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-4">
          <div className="bg-emerald-150 p-2 text-emerald-700 rounded-xl h-fit">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-slate-900 font-semibold text-sm">Send Instant Email Invites</h4>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              When student registration completes successfully, the Node backend compiles and dispatches a confirmation voucher with the student reference code.
            </p>
            <Link to="/register" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-850 mt-2">
              Launch desk <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
