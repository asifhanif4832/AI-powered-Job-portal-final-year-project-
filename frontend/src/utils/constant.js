/** Backend origin (REST + Socket.IO). Keep in sync with backend PORT / CORS. */
export const API_ORIGIN = "http://localhost:8000";

export const USER_API_END_POINT=`${API_ORIGIN}/api/v1/user`;
export const JOB_API_END_POINT=`${API_ORIGIN}/api/v1/job`;
export const APPLICATION_API_END_POINT=`${API_ORIGIN}/api/v1/application`;
export const COMPANY_API_END_POINT=`${API_ORIGIN}/api/v1/company`;
export const RECOMMENDATION_API_END_POINT=`${API_ORIGIN}/api/v1/recommendations`;  // ✅ add this line