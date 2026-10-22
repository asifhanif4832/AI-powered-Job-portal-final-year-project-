import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import axios from 'axios'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const emptyForm = (user) => ({
  fullname: user?.fullname ?? '',
  email: user?.email ?? '',
  phoneNumber: user?.phoneNumber != null ? String(user.phoneNumber) : '',
  bio: user?.profile?.bio ?? '',
  skills: Array.isArray(user?.profile?.skills)
    ? user.profile.skills.join(', ')
    : '',
  experience: user?.profile?.experience ?? '',
  file: null,
})

const UpdateProfileDialog = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false)
  const { user } = useSelector(store => store.auth)
  const [input, setInput] = useState(() => emptyForm(user))
  const dispatch = useDispatch()

  useEffect(() => {
    if (open && user) {
      setInput(emptyForm(user))
    }
  }, [open, user])

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0]
    setInput({ ...input, file })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('fullname', input.fullname)
    formData.append('email', input.email)
    formData.append('phoneNumber', input.phoneNumber)
    formData.append('bio', input.bio)
    formData.append('skills', input.skills)
    formData.append('experience', input.experience)
    if (input.file) {
      formData.append('file', input.file)
    }

    try {
      setLoading(true)
      const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      })
      if (res.data.success) {
        dispatch(setUser(res.data.user))
        toast.success(res.data.message)
        setOpen(false)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={submitHandler}>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full name</Label>
              <Input
                id="fullname"
                name="fullname"
                value={input.fullname}
                onChange={changeEventHandler}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={input.email}
                onChange={changeEventHandler}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={input.phoneNumber}
                onChange={changeEventHandler}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={input.bio}
                onChange={changeEventHandler}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Short introduction about yourself"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                name="skills"
                value={input.skills}
                onChange={changeEventHandler}
                placeholder="e.g. React, Node.js, Python"
              />
              <p className="text-xs text-gray-500">Separate with commas</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <textarea
                id="experience"
                name="experience"
                rows={4}
                value={input.experience}
                onChange={changeEventHandler}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Internships, projects, part-time work, or years of experience"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume">Resume (PDF)</Label>
              <Input
                id="resume"
                name="resume"
                type="file"
                accept="application/pdf"
                onChange={fileChangeHandler}
              />
              <p className="text-xs text-gray-500">
                Leave empty to keep your current resume
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {loading ? (
              <Button type="button" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </Button>
            ) : (
              <Button type="submit" className="bg-brand-700 hover:bg-brand-800">
                Save changes
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateProfileDialog
