import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, 
  Search, 
  Trash2, 
  Info, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Briefcase, 
  ArrowLeft, 
  AlertTriangle, 
  Building2 
} from "lucide-react";
import { WORKSHOPS } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter, search & pagination state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedWorkshop, setSelectedWorkshop] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(8); // Items per page

  // Inspect detail popup
  const [activeDetail, setActiveDetail] = useState(null);

  // Cancellation safety confirmation states
  const [cancellingId, setCancellingId] = useState(null);
  const [cancellingName, setCancellingName] = useState(null);
  const [cancellingLoader, setCancellingLoader] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Debouncing search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on type
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Sync details from endpoints
  useEffect(() => {
    fetchParticipants();
  }, [debouncedSearch, selectedWorkshop, page]);

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/participants", {
        params: {
          search: debouncedSearch || undefined,
          workshop: selectedWorkshop || undefined,
          page,
          limit,
        },
      });

      if (response.data.success) {
        setParticipants(response.data.results);
        setTotal(response.data.total);
      } else {
        setError(response.data.error || "Failed to search student roster.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Failed to sync directory. Ensure your backend is responding."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrigger = (participant) => {
    const id = participant._id || participant.id || "";
    setCancellingId(id);
    setCancellingName(participant.name);
    setSuccessMessage(null);
  };

  const handleCancelCancellation = () => {
    setCancellingId(null);
    setCancellingName(null);
  };

  const handlePerformCancellation = async () => {
    if (!cancellingId) return;
    setCancellingLoader(true);
    try {
      const response = await axios.delete(`/api/participant/${cancellingId}`);
      if (response.data.success) {
        setSuccessMessage(`Registration for ${cancellingName} has been successfully cancelled.`);
        setCancellingId(null);
        setCancellingName(null);
        // Clear active detail view if inspecting deleted item
        if (activeDetail && (activeDetail._id === cancellingId || activeDetail.id === cancellingId)) {
          setActiveDetail(null);
        }
        // Force refresh
        if (participants.length === 1 && page > 1) {
          setPage((prev) => prev - 1);
        } else {
          fetchParticipants();
        }
      } else {
        setError(response.data.error || "Failed to perform cancellation.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to cancel registration.");
    } finally {
      setCancellingLoader(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedWorkshop("");
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight text-slate-900">
            Participant Directory
          </h1>
          <p className="mt-1 text-slate-500 text-sm sm:text-base leading-relaxed">
            Review registration allocations, search attendees, filter by workshops, or cancel bookings in real-time.
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono font-semibold h-fit flex items-center gap-1.5 shadow-2xs">
          <Users className="w-4 h-4 text-blue-600" /> Total Registrations: {total}
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-sm font-medium flex justify-between items-center animate-fade-in shadow-2xs">
          <p>{successMessage}</p>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-sm flex gap-2 items-start shadow-2xs">
          <span className="font-semibold block shrink-0 mt-0.5">Error:</span>
          <div>
            <p className="font-medium text-rose-800">{error}</p>
            <button onClick={fetchParticipants} className="underline text-rose-700 font-semibold text-xs mt-1 block">
              Reload page list
            </button>
          </div>
        </div>
      )}

      {/* Safety Confirmation alert box */}
      {cancellingId && (
        <div className="mb-8 bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-xs animate-shake">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg text-amber-950">
                Cancel Workshop Booking?
              </h3>
              <p className="mt-1.5 text-slate-700 text-sm">
                You are initiating a booking cancellation for candidate <strong>{cancellingName}</strong>. This operation is permanent, and will release their allocated seat from database tracking.
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  onClick={handlePerformCancellation}
                  disabled={cancellingLoader}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 font-semibold px-4 py-2 rounded-xl text-xs text-white transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  {cancellingLoader ? (
                    "Processing..."
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" /> Confirm Cancellation
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelCancellation}
                  className="bg-white border border-slate-200 hover:bg-slate-100 font-medium px-4 py-2 rounded-xl text-xs text-slate-600 transition-all cursor-pointer"
                >
                  Keep Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtering Desk toolbar section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-3xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          <div className="md:col-span-5 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              name="search"
              placeholder="Search by name, college, email, phone or pass code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 focus:bg-white rounded-xl text-sm border border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-5 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Filter className="h-4 w-4" />
            </span>
            <select
              value={selectedWorkshop}
              onChange={(e) => {
                setSelectedWorkshop(e.target.value);
                setPage(1);
              }}
              className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white rounded-xl text-sm border border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 focus:outline-hidden cursor-pointer"
            >
              <option value="">All Workshop Allotments</option>
              {WORKSHOPS.map((workshopTerm) => (
                <option key={workshopTerm} value={workshopTerm}>
                  {workshopTerm}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleResetFilters}
              disabled={!search && !selectedWorkshop}
              className="w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear Filters
            </button>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Center Section - Main Directory Roster */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-3xs">
              <LoadingSpinner message="Querying registered workshop participants..." size="md" />
            </div>
          ) : participants.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-3xs text-center">
              <div className="mx-auto text-slate-400 border border-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50 mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                No matching participants
              </h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">
                {search || selectedWorkshop 
                  ? "We couldn't find any registrations that fit your current active search filters." 
                  : "There are zero entries on file. Register your first candidate to get started!"}
              </p>
              {(search || selectedWorkshop) && (
                <button
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-2xs"
                >
                  Reset Active Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Cards for each participant */}
              {participants.map((person) => {
                const personId = person._id || person.id || "";
                const isInspected = activeDetail && (activeDetail._id === personId || activeDetail.id === personId);
                return (
                  <div
                    key={personId}
                    onClick={() => setActiveDetail(person)}
                    className={`bg-white border hover:border-slate-300 rounded-2xl p-5 shadow-3xs transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer relative overflow-hidden ${
                      isInspected ? "border-blue-500 bg-blue-50/10 ring-2 ring-blue-500/10" : "border-slate-200"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-display font-bold text-slate-900 text-base block truncate">
                          {person.name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800">
                          {person.referenceId}
                        </span>
                      </div>

                      <p className="text-slate-700 text-sm font-semibold mb-1 flex items-center gap-1 truncate">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {person.workshop}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {person.organization}
                        </span>
                        <span>•</span>
                        <span>{person.email}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDetail(person);
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 transition-colors"
                      >
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        Inspect Receipt
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrigger(person);
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                        title="Cancel Registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Pagination controls footer */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs mt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  <span className="text-xs font-semibold text-slate-500">
                    Page <b className="text-slate-900">{page}</b> of <b className="text-slate-900">{totalPages}</b>
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Right Section - Detail Inspection Voucher Drawer */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl shadow-3xs divide-y divide-slate-100 overflow-hidden">
            {activeDetail ? (
              <div>
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                  <h3 className="font-display font-bold text-sm tracking-tight">
                    Registration Voucher Spec
                  </h3>
                  <button
                    onClick={() => setActiveDetail(null)}
                    className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>

                <div className="p-5 space-y-4 font-sans">
                  
                  <div className="text-center bg-blue-50/80 border border-blue-150 p-4 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      CONFIRMATION CODE
                    </span>
                    <span className="text-blue-700 font-mono font-bold text-lg block mt-0.5 tracking-wider">
                      {activeDetail.referenceId}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Full Name
                    </label>
                    <p className="text-slate-900 font-bold block text-sm mt-0.5">
                      {activeDetail.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Workshop Allotment
                    </label>
                    <p className="text-slate-900 font-semibold block text-xs mt-0.5 leading-snug">
                      {activeDetail.workshop}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        College / Institution
                      </label>
                      <p className="text-slate-800 text-xs font-medium block mt-0.5 truncate">
                        {activeDetail.organization}
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Phone Contact
                      </label>
                      <p className="text-slate-800 text-xs font-medium block mt-0.5">
                        {activeDetail.phone}
                      </p>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Admission Status:</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200">
                        CONFIRMED
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Registration Date:</span>
                      <span className="text-slate-600 font-medium inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(activeDetail.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => handleDeleteTrigger(activeDetail)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-700 hover:text-rose-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Cancel Booking
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 font-sans">
                <Info className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                <h4 className="font-semibold text-slate-700 text-sm">No ticket inspected</h4>
                <p className="text-xs mt-1 text-slate-400 leading-relaxed">
                  Select any participant in the directory roster to view their complete printable admission ticket details.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
