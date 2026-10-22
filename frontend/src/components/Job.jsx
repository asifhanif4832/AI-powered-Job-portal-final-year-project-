import React, { useState } from "react";
import { Button } from "./ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { toggleSavedJobId } from "@/redux/jobSlice";
import { toast } from "sonner";

const Job = ({ job }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { savedJobIds } = useSelector((store) => store.job);
  const [saving, setSaving] = useState(false);

  const jobId = job?._id ? String(job._id) : "";
  const isSaved = jobId && savedJobIds.includes(jobId);
  const canSave = user?.role === "student";

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const today = new Date();
    createdAt.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today - createdAt;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleToggleSave = async (e) => {
    e?.stopPropagation?.();
    if (!canSave || !jobId) {
      toast.error("Please sign in as a student to save jobs");
      return;
    }
    try {
      setSaving(true);
      const res = await axios.post(
        `${USER_API_END_POINT}/saved-jobs/${jobId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(toggleSavedJobId(jobId));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update saved jobs"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-surface-card p-5 shadow-sm transition-all duration-200 hover:border-brand-200 hover:shadow-md hover:shadow-brand-500/10">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {daysAgoFunction(job?.createdAt) === 0
            ? "Today"
            : `${daysAgoFunction(job?.createdAt)} days ago`}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full border-slate-200"
          disabled={!canSave || saving}
          onClick={handleToggleSave}
          title={canSave ? (isSaved ? "Remove from saved" : "Save for later") : "Students only"}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bookmark
              className={isSaved ? "fill-brand-600 text-brand-600" : "text-slate-500"}
            />
          )}
        </Button>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          <Avatar className="h-12 w-12">
            <AvatarImage src={job?.company?.logo} />
          </Avatar>
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900">{job?.company?.name}</h3>
          <p className="text-sm text-slate-500">{job?.location}</p>
        </div>
      </div>

      <div className="mt-4 flex-1">
        <h4 className="text-lg font-bold text-slate-900">{job?.title}</h4>
        <p className="mt-1 line-clamp-3 text-sm text-slate-600">{job?.description}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge className="border-0 bg-blue-50 font-medium text-blue-800">
          {job?.position} positions
        </Badge>
        <Badge className="border-0 bg-accent-50 font-medium text-accent-700">
          {job?.jobType}
        </Badge>
        <Badge className="border-0 bg-brand-50 font-medium text-brand-800">
          {job?.salary}k
        </Badge>
      </div>

      <div className="mt-5 flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-slate-200"
          onClick={() => navigate(`/description/${job?._id}`)}
        >
          Details
        </Button>
        <Button
          type="button"
          className="flex-1 bg-brand-700 hover:bg-brand-800"
          disabled={!canSave || saving}
          onClick={handleToggleSave}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wait
            </>
          ) : isSaved ? (
            "Saved"
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Job;
