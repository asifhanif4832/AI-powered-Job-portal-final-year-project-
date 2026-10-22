import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { PageShell, PageContainer, SectionHeader } from "./layout/PageShell";
import { USER_API_END_POINT } from "@/utils/constant";
import { setSavedJobIds } from "@/redux/jobSlice";
import { Loader2 } from "lucide-react";

const SavedJobs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { savedJobIds } = useSelector((store) => store.job);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const visibleJobs = jobs.filter((j) =>
    savedJobIds.includes(String(j._id))
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      navigate("/");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${USER_API_END_POINT}/saved-jobs/list`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setJobs(res.data.jobs || []);
          dispatch(
            setSavedJobIds((res.data.jobs || []).map((j) => String(j._id)))
          );
        }
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, navigate, dispatch]);

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="py-8">
        <SectionHeader
          eyebrow="Bookmarks"
          title="Saved jobs"
          description="Roles you saved to review or apply later."
        />

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-surface-card py-16 text-center text-slate-500">
            No saved jobs yet. Save listings from the Jobs page.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleJobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Job job={job} />
              </motion.div>
            ))}
          </div>
        )}
      </PageContainer>
    </PageShell>
  );
};

export default SavedJobs;
