import { useEffect } from "react";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { useDispatch } from "react-redux";
import { setPipelineSummary, setRecruiterPipeline } from "@/redux/applicationSlice";

const useGetRecruiterPipeline = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const res = await axios.get(`${APPLICATION_API_END_POINT}/recruiter/pipeline`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          dispatch(setRecruiterPipeline(res.data.applications || []));
          dispatch(setPipelineSummary(res.data.summary || { total: 0, byStatus: {} }));
        }
      } catch {
        dispatch(setRecruiterPipeline([]));
      }
    };
    fetchPipeline();
  }, [dispatch]);
};

export default useGetRecruiterPipeline;
