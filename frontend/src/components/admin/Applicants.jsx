import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import axios from 'axios'
import { APPLICATION_API_END_POINT } from '@/utils/constant'
import { Link, useParams } from 'react-router-dom'


import { useDispatch, useSelector } from 'react-redux'
import { setAllApplicants } from '@/redux/applicationSlice'


const Applicants = () => {
    const params=useParams();
    const dispatch=useDispatch();
    const {applicants}=useSelector(store=>store.application);
    useEffect(()=>{
        const fetchAllApplicants= async ()=>{
            try {
                const res=await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`,{withCredentials:true});
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllApplicants();
    },[dispatch, params.id]);
  return (
    <div className="min-h-screen bg-surface-page">
        <Navbar/>
        <div className='max-w-7xl mx-auto px-6 sm:px-10 py-8'>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h1 className='font-bold text-xl'>Applicants {applicants?.applications?.length}</h1>
              <Link to="/admin/pipeline" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Open full pipeline
              </Link>
            </div>
            <ApplicantsTable/>
        </div>
    </div>
  )
}

export default Applicants