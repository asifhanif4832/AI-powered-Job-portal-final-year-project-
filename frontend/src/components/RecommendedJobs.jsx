import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import useGetRecommendedJobs from "../hooks/useGetRecommendedJobs";
import { MapPin, Briefcase, Sparkles, Clock } from "lucide-react";

// Score color/label based on match percentage
const getScoreStyle = (score) => {
  if (score >= 80) return { bar: "bg-green-500",  badge: "bg-green-100 text-green-700",  label: "Excellent" };
  if (score >= 60) return { bar: "bg-blue-500",   badge: "bg-blue-100 text-blue-700",    label: "Good"      };
  return              { bar: "bg-purple-500", badge: "bg-purple-100 text-purple-700", label: "Fair"      };
};

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const { bar, badge, label } = getScoreStyle(job.matchScore);
  const daysAgo = Math.floor(
    (new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">

      {/* Company + Match Score */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {job.company?.logo ? (
            <img
              src={job.company.logo}
              alt={job.company?.name}
              className="w-12 h-12 rounded-xl object-cover border border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl">
              {job.company?.name?.[0] || "J"}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 text-[15px] leading-tight">
              {job.title}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">{job.company?.name}</p>
          </div>
        </div>

        {/* Match Badge */}
        <span className={`${badge} text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0`}>
          <Sparkles size={11} />
          {job.matchScore}% · {label}
        </span>
      </div>

      {/* Match Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] text-gray-400 mb-1">
          <span>Match Score</span>
          <span>{job.matchScore}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${bar}`}
            style={{ width: `${job.matchScore}%` }}
          />
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {job.location}
          </span>
        )}
        {job.jobType && (
          <span className="flex items-center gap-1">
            <Briefcase size={11} /> {job.jobType}
          </span>
        )}
        {job.salary && (
          <span className="font-semibold text-gray-700">{job.salary} Thousands</span>
        )}
        {job.position && (
          <span>{job.position} Opening{job.position > 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Skills */}
      {job.requirements?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.requirements.slice(0, 5).map((skill, i) => (
            <Badge key={i} variant="secondary" className="text-[11px] px-2 py-0.5">
              {skill}
            </Badge>
          ))}
          {job.requirements.length > 5 && (
            <Badge variant="outline" className="text-[11px] px-2 py-0.5">
              +{job.requirements.length - 5} more
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={11} />
          {daysAgo === 0 ? "Posted today" : `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`}
        </span>
        <Button
          size="sm"
          onClick={() => navigate(`/description/${job._id}`)}
          className="bg-purple-700 hover:bg-purple-800 text-white text-xs h-8 px-4 rounded-lg"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const RecommendedJobs = () => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "student") {
      navigate("/admin/companies", { replace: true });
    }
  }, [user, navigate]);

  const { recommendations, loading, error, userSkills } = useGetRecommendedJobs();

  if (user && user.role !== "student") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-purple-600" size={22} />
            <h1 className="text-2xl font-bold text-gray-900">Recommended Jobs</h1>
          </div>
          <p className="text-gray-500 text-sm">
            AI-powered matches based on your profile skills · Only 50%+ matches shown
          </p>

          {/* User Skills */}
          {userSkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-500 font-medium">Your skills:</span>
              {userSkills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-base font-medium">Analyzing your skills...</p>
            <p className="text-sm mt-1">Finding the best job matches for you</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-500 font-medium mb-2">{error}</p>
            {error.includes("skills") && (
              <Button
                className="mt-3 bg-purple-700 hover:bg-purple-800"
                onClick={() => (window.location.href = "/profile")}
              >
                Update My Profile
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <p className="text-sm text-gray-500 mb-5">
              Found{" "}
              <span className="font-bold text-purple-700 text-base">
                {recommendations.length}
              </span>{" "}
              job{recommendations.length !== 1 ? "s" : ""} matching your profile
            </p>

            {/* Empty State */}
            {recommendations.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-700 font-semibold mb-2">No matches found yet</p>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  Only jobs matching 50% or more of your skills are recommended. Try adding more skills to your profile, or check back as new jobs are posted.
                </p>
                <Button
                  className="bg-purple-700 hover:bg-purple-800"
                  onClick={() => (window.location.href = "/profile")}
                >
                  Update My Skills
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {recommendations.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default RecommendedJobs;
