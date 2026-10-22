// JobSetup.jsx
import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const JobSetup = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { companies } = useSelector(store => store.company)

  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "", // always a string
    salary: "",
    location: "",
    jobType: "",
    experience: "",
    position: 0,
    companyId: ""
  })

  // 🔹 Fetch job by ID
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${id}`, {
          withCredentials: true
        })
        if (res.data.success) {
          const job = res.data.job
          setInput({
            title: job.title || "",
            description: job.description || "",
            requirements: Array.isArray(job.requirements)
              ? job.requirements.join(", ")
              : typeof job.requirements === "string"
              ? job.requirements
              : "",
            salary: job.salary || "",
            location: job.location || "",
            jobType: job.jobType || "",
            experience: job.experienceLevel || "",
            position: job.position || 0,
            companyId: job.company?._id || ""
          })
        }
      } catch (err) {
        toast.error("Failed to load job")
      }
    }
    fetchJob()
  }, [id])

  // 🔹 Handle input change
  const changeHandler = (e) => {
    const { name, value } = e.target
    setInput(prev => ({ ...prev, [name]: value }))
  }

  // 🔹 Handle company select
  const selectChangeHandler = (value) => {
    setInput(prev => ({ ...prev, companyId: value }))
  }

  // 🔹 Submit update
  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)

      const bodyToSend = {
        ...input,
        requirements: input.requirements || "" // send string, same as PostJob
      }

      const res = await axios.put(`${JOB_API_END_POINT}/update/${id}`, bodyToSend, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      })

      if (res.data.success) {
        toast.success(res.data.message)
        navigate("/admin/jobs")
      }
    } catch (err) {
      console.log(err.response?.data) // useful to debug backend errors
      toast.error(err.response?.data?.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className='flex items-center justify-center w-screen my-5'>
        <form onSubmit={submitHandler} className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md'>
          <div className='flex items-center gap-4 mb-4'>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/jobs")}>
              <ArrowLeft />
            </Button>
            <h1 className='text-xl font-bold'>Edit Job</h1>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <div>
              <Label>Title</Label>
              <Input type="text" name="title" value={input.title} onChange={changeHandler} className="my-1" />
            </div>

            <div>
              <Label>Description</Label>
              <Input type="text" name="description" value={input.description} onChange={changeHandler} className="my-1" />
            </div>

            <div>
              <Label>Requirements</Label>
              <Input type="text" name="requirements" value={input.requirements} onChange={changeHandler} className="my-1" />
              <p className="text-xs text-gray-500">Separate multiple requirements with a comma</p>
            </div>

            <div>
              <Label>Salary</Label>
              <Input type="text" name="salary" value={input.salary} onChange={changeHandler} className="my-1" />
            </div>

            <div>
              <Label>Location</Label>
              <Input type="text" name="location" value={input.location} onChange={changeHandler} className="my-1" />
            </div>

            <div>
              <Label>Job Type</Label>
              <Input type="text" name="jobType" value={input.jobType} onChange={changeHandler} className="my-1" />
            </div>

            <div>
              <Label>Experience</Label>
              <Input type="text" name="experience" value={input.experience} onChange={changeHandler} className="my-1" />
            </div>

            <div>
              <Label>No of Positions</Label>
              <Input type="number" name="position" value={input.position} onChange={changeHandler} className="my-1" />
            </div>

            {companies.length > 0 && (
              <div>
                <Label>Company</Label>
                <Select onValueChange={selectChangeHandler} value={input.companyId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {companies.map(company => (
                        <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {loading
            ? <Button className='w-full my-4'><Loader2 className='animate-spin mr-2' />Updating...</Button>
            : <Button type="submit" className='w-full my-4'>Update Job</Button>
          }

          {companies.length === 0 && <p className='text-xs text-red-600 font-bold text-center my-3'>Please register a Company first to assign a job</p>}
        </form>
      </div>
    </div>
  )
}

export default JobSetup
