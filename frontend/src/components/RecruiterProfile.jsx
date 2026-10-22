import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Navbar from "./shared/Navbar";
import { PageShell, PageContainer } from "./layout/PageShell";
import { USER_API_END_POINT } from "@/utils/constant";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

export default function RecruiterProfile() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/recruiters/${id}`, {
          withCredentials: true,
        });
        if (res.data?.success) setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  return (
    <PageShell>
      <Navbar />
      <PageContainer className="py-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Loading recruiter profile...</div>
        ) : !data?.recruiter ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Recruiter not found.</div>
        ) : (
          <>
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-slate-100">
                    <AvatarImage src={data.recruiter?.profile?.profilePhoto} />
                  </Avatar>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{data.recruiter.fullname}</p>
                    <p className="text-sm text-slate-600">{data.recruiter.email}</p>
                    <Badge className="mt-2 border-0 bg-violet-100 text-violet-800">Recruiter</Badge>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Jobs posted: <span className="font-bold text-slate-900">{data.recruiter.jobsPosted}</span>
                </div>
              </div>
              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                {data.recruiter?.profile?.bio || "No recruiter bio provided."}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Recent posted jobs</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {data.jobs?.length ? (
                  data.jobs.map((job) => (
                    <Link
                      key={job._id}
                      to={`/description/${job._id}`}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md"
                    >
                      <p className="font-semibold text-slate-900">{job.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {job.company?.name || "Company"} • {job.location}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {job.jobType} • {job.salary}k • {job.experienceLevel} yrs
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                    No public job posts yet.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </PageContainer>
    </PageShell>
  );
}
