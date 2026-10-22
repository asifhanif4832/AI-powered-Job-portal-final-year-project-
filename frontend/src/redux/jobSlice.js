import { createSlice } from "@reduxjs/toolkit";
const jobSlice=createSlice({
    name:"job",
    initialState:{
        allJobs:[],

        allAdminJobs:[],
        singleJob:null,
        searchJobByText:"",
        allAppliedJobs:[],
        searchedQuery:"",
        savedJobIds:[],
    },
    reducers:{
        //actions
        setAllJobs:(state,action)=>{
            state.allJobs=action.payload;
        },
        
        setSingleJob:(state,action)=>{
          state.singleJob=action.payload;
        } ,
        setAllAdminJobs:(state,action)=>{
            state.allAdminJobs=action.payload;
        },
        setSearchJobByText:(state,action)=>{
            state.searchJobByText=action.payload;
        },
        setAllAppliedJobs:(state,action)=>{
            state.allAppliedJobs=action.payload;
        },
        setSearchedQuery:(state,action)=>{
            state.searchedQuery=action.payload;
        },
        setSavedJobIds:(state,action)=>{
            state.savedJobIds=action.payload;
        },
        toggleSavedJobId:(state,action)=>{
            const id=String(action.payload);
            const idx=state.savedJobIds.indexOf(id);
            if(idx>-1){
                state.savedJobIds.splice(idx,1);
            }else{
                state.savedJobIds.push(id);
            }
        },
    }
});
export const{setAllJobs,setSingleJob,setAllAdminJobs,setSearchJobByText,setAllAppliedJobs,setSearchedQuery,setSavedJobIds,toggleSavedJobId}=jobSlice.actions;
export default jobSlice.reducer;