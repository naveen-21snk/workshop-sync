import { useState } from "react";
import axios from "axios";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Bookmark, 
  Calendar, 
  Printer, 
  RefreshCw 
} from "lucide-react";
import { WORKSHOPS } from "../types";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    workshop: "",
    organization: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  
  // Confirmation state
  const [registeredUser, setRegisteredUser] = useState(null);
  const [emailStatus, setEmailStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error when typing/selecting
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-()]{7,18}$/;

    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required.";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email Address is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid academic/personal email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number (minimum 7 digits).";
    }

    if (!formData.workshop) {
      newErrors.workshop = "Please select a workshop from the active curriculum.";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "College or Organization is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/register", formData);
      if (response.data.success) {
        setRegisteredUser(response.data.participant);
        setEmailStatus(response.data.emailStatus || "Dispatched");
        // Clear form
        setFormData({
          name: "",
          email: "",
          phone: "",
          workshop: "",
          organization: "",
        });
      } else {
        setServerError(response.data.error || "An error occurred during submission.");
      }
    } catch (err) {
      console.error(err);
      setServerError(
        err.response?.data?.error || "Failed to contact registration servers. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    setRegisteredUser(null);
    setServerError(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // Render Confirmation Vouch Ticket State
  if (registeredUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="font-display font-bold text-3xl tracking-tight text-slate-900">
            Registration Confirmed!
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            Your seat has been reserved successfully. The system has logged your references under voucher ID.
          </p>
        </div>

        {/* Outer Ticket stub card wrapper */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-md overflow-hidden relative print:border-none print:shadow-none mb-8">
          
          {/* Header banner */}
          <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-blue-400">
                Official Admission Pass
              </p>
              <h2 className="font-display font-bold text-lg mt-0.5">
                Workshop Desk Gatepass
              </h2>
            </div>
            <div className="text-right">
              <span className="bg-blue-600 text-white font-mono text-xs font-semibold px-2.5 py-1 rounded-md">
                GATEPASS // IN
              </span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Primary ticket info */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Workshop Selected
                  </label>
                  <p className="text-slate-900 font-bold text-lg leading-snug mt-0.5">
                    {registeredUser.workshop}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Attendee Name
                    </label>
                    <p className="text-slate-800 font-semibold mt-0.5">
                      {registeredUser.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Affiliation / College
                    </label>
                    <p className="text-slate-800 font-semibold mt-0.5">
                      {registeredUser.organization}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Email Address
                    </label>
                    <p className="text-slate-700 text-sm font-medium mt-0.5">
                      {registeredUser.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Contact Line
                    </label>
                    <p className="text-slate-700 text-sm font-medium mt-0.5">
                      {registeredUser.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reference ID Right Stub Column */}
              <div className="border-t md:border-t-0 md:border-l border-dashed border-slate-300 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between items-center md:items-start">
                <div className="text-center md:text-left">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Voucher ID
                  </label>
                  <p className="text-blue-700 font-mono font-bold text-lg tracking-wider mt-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    {registeredUser.referenceId}
                  </p>
                </div>

                <div className="mt-4 md:mt-0 space-y-2">
                  <div className="text-center md:text-left">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      Registration Date
                    </span>
                    <span className="text-slate-600 text-xs font-medium inline-flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(registeredUser.registrationDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="text-center md:text-left">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      Seat Status
                    </span>
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                      Confirmed Entry
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification alert segment */}
            <div className="mt-8 pt-6 border-t border-slate-100 bg-blue-50/50 -mx-6 -mb-6 md:-mx-8 md:-mb-8 px-6 py-4 md:px-8 border-b-2 rounded-b-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex gap-2 items-center text-xs text-blue-800">
                <Bookmark className="w-4 h-4 text-blue-600 shrink-0" />
                <p>
                  <strong>Notification Dispatcher:</strong> {emailStatus}
                </p>
              </div>
              <button 
                onClick={handlePrint}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Voucher
              </button>
            </div>
          </div>
        </div>

        {/* Bottom utility links */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handleRegisterAnother}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all focus:outline-hidden cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Register Another Student
          </button>
        </div>
      </div>
    );
  }

  // Render Input Form State
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl tracking-tight text-slate-900">
          Student Registration Desk
        </h1>
        <p className="mt-1 text-slate-500 text-sm sm:text-base leading-relaxed">
          Enrol a new candidate in an academic workshop program. Ensure all student-provided details are valid before confirmation.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-sm flex gap-3 items-start animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Submission Rejected:</span>
            <p className="mt-1 text-rose-700 font-medium">{serverError}</p>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="form-input-name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="E.g., Dr. Sophia Thompson"
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-900 border ${
                    errors.name ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  } focus:outline-hidden focus:ring-3 placeholder:text-slate-400 uppercase-first`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="form-input-email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="sophia@organization.edu"
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-900 border ${
                    errors.email ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  } focus:outline-hidden focus:ring-3 placeholder:text-slate-400`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="phone"
                  id="form-input-phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number or +1..."
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-900 border ${
                    errors.phone ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  } focus:outline-hidden focus:ring-3 placeholder:text-slate-400`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.phone}</p>
              )}
            </div>

            {/* Workshop Selection */}
            <div>
              <label htmlFor="workshop" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Workshop Choice <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <select
                  name="workshop"
                  id="form-input-workshop"
                  value={formData.workshop}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-900 border ${
                    errors.workshop ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  } focus:outline-hidden focus:ring-3 placeholder:text-slate-400 cursor-pointer`}
                >
                  <option value="">-- Choose Workshop Stream --</option>
                  {WORKSHOPS.map((workshopOption) => (
                    <option key={workshopOption} value={workshopOption}>
                      {workshopOption}
                    </option>
                  ))}
                </select>
              </div>
              {errors.workshop && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.workshop}</p>
              )}
            </div>

            {/* College / Organization */}
            <div>
              <label htmlFor="organization" className="block text-sm font-semibold text-slate-700 mb-1.5">
                College / Institution <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="organization"
                  id="form-input-organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="KPR College of Engineering"
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-900 border ${
                    errors.organization ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  } focus:outline-hidden focus:ring-3 placeholder:text-slate-400`}
                />
              </div>
              {errors.organization && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.organization}</p>
              )}
            </div>

          </div>

          <div className="border-t border-slate-100 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              id="form-submit-button"
              className={`inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 font-medium text-white px-6 py-3 rounded-xl text-sm transition-all focus:outline-hidden cursor-pointer ${
                loading ? "opacity-75 cursor-wait" : ""
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Enrolment...
                </>
              ) : (
                <>
                  Confirm Registration
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
