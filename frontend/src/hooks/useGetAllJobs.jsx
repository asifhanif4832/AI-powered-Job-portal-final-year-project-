import React, { useEffect } from "react";
import axios from "axios";
import { JOB_API_END_POINT, USER_API_END_POINT } from "@/utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { setAllJobs, setSavedJobIds } from "@/redux/jobSlice";

const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const { searchedQuery } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        const res = await axios.get(
          `${JOB_API_END_POINT}/get?keyword=${searchedQuery || ""}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setAllJobs(res.data.jobs));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllJobs();
  }, [searchedQuery, dispatch]);

  useEffect(() => {
    const fetchSavedIds = async () => {
      if (user?.role !== "student") {
        dispatch(setSavedJobIds([]));
        return;
      }
      try {
        const res = await axios.get(`${USER_API_END_POINT}/saved-jobs`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSavedJobIds(res.data.jobIds || []));
        }
      } catch {
        dispatch(setSavedJobIds([]));
      }
    };
    fetchSavedIds();
  }, [user?._id, user?.role, dispatch]);
};

export default useGetAllJobs;
