import { createSlice } from "@reduxjs/toolkit";
const applicationSlice=createSlice({
    name:'application',
    initialState:{
        applicants:[],
        recruiterPipeline:[],
        pipelineSummary:{ total: 0, byStatus: {} },
    },
    reducers:{
        setAllApplicants:(state,action)=>{
            state.applicants=action.payload;
        },
        setRecruiterPipeline:(state,action)=>{
            state.recruiterPipeline=action.payload || [];
        },
        setPipelineSummary:(state,action)=>{
            state.pipelineSummary=action.payload || { total: 0, byStatus: {} };
        },
    }
});
export const {setAllApplicants,setRecruiterPipeline,setPipelineSummary}=applicationSlice.actions;
export default applicationSlice.reducer;