import { useEffect, useState } from "react";
import axios from "axios";
import { RECOMMENDATION_API_END_POINT } from "../utils/constant";

const useGetRecommendedJobs = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [userSkills, setUserSkills]           = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(RECOMMENDATION_API_END_POINT, {
          withCredentials: true, // sends your auth cookie
        });
        if (res.data.success) {
          setRecommendations(res.data.recommendations || []);
          setUserSkills(res.data.userSkills || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load recommendations.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { recommendations, loading, error, userSkills };
};

export default useGetRecommendedJobs;