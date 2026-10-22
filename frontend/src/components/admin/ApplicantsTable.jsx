import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { MoreHorizontal, Sparkles, X, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import store from '@/redux/store'
import { toast } from 'sonner'
import axios from 'axios'
import { APPLICATION_API_END_POINT } from '@/utils/constant'
import { setAllApplicants } from '@/redux/applicationSlice'

const shortlistingStatus = ["Pending", "Shortlisted", "Interview_scheduled", "Hired", "Rejected"]

const parseAnalysis = (text) => {
    const result = { score: null, skillsMatch: '', experience: '', strengths: '', weaknesses: '', recommendation: '' }
    if (!text) return result

    // Match score without being tricked by "(0-100)"
    const scorePatterns = [
        /OVERALL SCORE[^\n:]*:[*\s]*(\d{1,3})/i,
        /OVERALL SCORE\s*\([0-9-]+\)[*\s:]*(\d{1,3})/i,
        /SCORE[^\n:]*:[*\s]*(\d{1,3})/i,
        /(\d{1,3})\s*\/\s*100/i,
        /score[:\s*]+(\d{1,3})/i,
    ]
    for (const pattern of scorePatterns) {
        const m = text.match(pattern)
        if (m) {
            const num = parseInt(m[1], 10)
            if (!isNaN(num) && num >= 0 && num <= 100) {
                result.score = num
                break
            }
        }
    }

    // Extract sections — handles bold numbered format like "**2. SKILLS MATCH:**"
    const extractSection = (startLabel, endLabel) => {
        const regex = new RegExp(
            `(?:\n|^)[*#\\s]*(?:\\d+[\\.\\)]\\s*)?\\*\\*?${startLabel}[^:\\n]*\\*\\*?:?[\\s\\-]*(.*?)(?=(?:\n[*#\\s]*(?:\\d+[\\.\\)]\\s*)?\\*\\*?${endLabel}|\\Z))`,
            'is'
        )
        const m = text.match(regex)
        if (m) {
            return m[1].replace(/^\*+\s*/, '').replace(/\*+$/, '').trim()
        }
        const fallbackRegex = new RegExp(
            `${startLabel}[^:\\n]*:[\\s\\-]*(.*?)(?=${endLabel}|$)`,
            'is'
        )
        const fm = text.match(fallbackRegex)
        return fm ? fm[1].replace(/^\*+\s*/, '').replace(/\*+$/, '').trim() : ''
    }

    result.skillsMatch    = extractSection('SKILLS MATCH',        'EXPERIENCE ANALYSIS')
    result.experience     = extractSection('EXPERIENCE ANALYSIS', 'STRENGTHS')
    result.strengths      = extractSection('STRENGTHS',           'WEAKNESSES')
    result.weaknesses     = extractSection('WEAKNESSES',          'RECOMMENDATION')
    result.recommendation = extractSection('RECOMMENDATION',      'ZZZNOMATCH')

    return result
}

const ScoreRing = ({ score }) => {
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#3b82f6' : '#ef4444'
    const label = score >= 75 ? 'Strong Match' : score >= 50 ? 'Average Match' : 'Weak Match'
    const bg    = score >= 75 ? '#d1fae5'      : score >= 50 ? '#dbeafe'       : '#fee2e2'
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: `conic-gradient(${color} ${score * 3.6}deg, #f3f4f6 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{
                    width: 76, height: 76, borderRadius: '50%', background: '#fff',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>/100</span>
                </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color, background: bg, padding: '3px 12px', borderRadius: 99 }}>
                {label}
            </span>
        </div>
    )
}

const Section = ({ icon, title, content, borderColor }) => (
    <div style={{ marginBottom: 14, borderLeft: `3px solid ${borderColor}`, paddingLeft: 12, borderRadius: '0 8px 8px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            {icon}
            <span style={{ fontSize: 12, fontWeight: 700, color: borderColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {title}
            </span>
        </div>
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap', background: '#f9fafb', padding: '8px 12px', borderRadius: 8 }}>
            {content || '—'}
        </div>
    </div>
)

const ResumeAnalysisModal = ({ applicantName, analysis, onClose }) => {
    const parsed = parseAnalysis(analysis)
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
            <div style={{
                background: '#fff', borderRadius: 20, width: '100%', maxWidth: 660,
                maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.25)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '18px 24px', borderBottom: '1px solid #f3f4f6',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    position: 'sticky', top: 0, background: '#fff', borderRadius: '20px 20px 0 0', zIndex: 10
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ background: '#ede9fe', borderRadius: 8, padding: 6, display: 'flex' }}>
                                <Sparkles size={16} color="#7c3aed" />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 17, color: '#111827' }}>AI Resume Analysis</span>
                        </div>
                        <p style={{ margin: '3px 0 0 34px', fontSize: 13, color: '#6b7280' }}>{applicantName}</p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
                        <X size={16} color="#374151" />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: 24 }}>
                    {parsed.score !== null && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28, paddingBottom: 24, borderBottom: '1px dashed #e5e7eb' }}>
                            <ScoreRing score={parsed.score} />
                        </div>
                    )}
                    <Section icon={<CheckCircle size={13} color="#3b82f6" />} title="Skills Match"        content={parsed.skillsMatch}    borderColor="#3b82f6" />
                    <Section icon={<AlertCircle size={13} color="#f59e0b" />} title="Experience Analysis" content={parsed.experience}     borderColor="#f59e0b" />
                    <Section icon={<CheckCircle size={13} color="#10b981" />} title="Strengths"           content={parsed.strengths}      borderColor="#10b981" />
                    <Section icon={<XCircle     size={13} color="#ef4444" />} title="Weaknesses"          content={parsed.weaknesses}     borderColor="#ef4444" />
                    <Section icon={<Sparkles    size={13} color="#7c3aed" />} title="Recommendation"      content={parsed.recommendation} borderColor="#7c3aed" />
                </div>

                {/* Footer */}
                <div style={{
                    padding: '14px 24px', borderTop: '1px solid #f3f4f6',
                    display: 'flex', justifyContent: 'flex-end',
                    position: 'sticky', bottom: 0, background: '#fff', borderRadius: '0 0 20px 20px'
                }}>
                    <button onClick={onClose} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 24px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

const ApplicantsTable = () => {
    const { applicants } = useSelector(store => store.application)
    const dispatch = useDispatch()
    const [modal, setModal]         = useState({ open: false, analysis: '', applicantName: '' })
    const [loadingId, setLoadingId] = useState(null)

    const statusHandler = async (status, id) => {
        try {
            axios.defaults.withCredentials = true
            let payload = { status }
            if (String(status).toLowerCase() === "interview_scheduled") {
                const dt = window.prompt("Enter interview date & time (YYYY-MM-DDTHH:mm), e.g. 2026-04-05T14:30")
                if (!dt) return
                const notes = window.prompt("Optional interview notes for candidate (leave blank if none)") || ""
                payload = { status, interviewAt: dt, interviewNotes: notes }
            }
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, payload, { withCredentials: true })
           if (res.data.success) {
    toast.success(res.data.message)
    const updated = applicants?.applications?.map((item) =>
        item._id === id 
            ? { 
                ...item,                        // keep ALL existing data (applicant, resume etc)
                status: res.data.application.status,             // only update status
                interviewAt: res.data.application.interviewAt,   // only update interview
                interviewNotes: res.data.application.interviewNotes // only update notes
              } 
            : item
    )
    dispatch(setAllApplicants({ ...applicants, applications: updated }))
}
        } catch (error) {
            toast.error(error?.response?.data?.message || "Status update failed")
        }
    }

    const analyzeResumeHandler = async (applicationId, applicantName) => {
        try {
            setLoadingId(applicationId)
            const res = await axios.get(`${APPLICATION_API_END_POINT}/analyze/${applicationId}`, { withCredentials: true })
            if (res.data.success) {
                const score = res.data.matchScore ?? parseAnalysis(res.data.analysis).score
                if (score !== null && score !== undefined) {
                    const updated = applicants?.applications?.map((item) =>
                        item._id === applicationId ? { ...item, matchScore: score } : item
                    )
                    dispatch(setAllApplicants({ ...applicants, applications: updated }))
                }
                setModal({ open: true, analysis: res.data.analysis, applicantName })
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Resume analysis failed")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div>
            {modal.open && (
                <ResumeAnalysisModal
                    applicantName={modal.applicantName}
                    analysis={modal.analysis}
                    onClose={() => setModal({ open: false, analysis: '', applicantName: '' })}
                />
            )}

            <Table>
                <TableCaption>A list of your recent applied users</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>AI Match</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>AI Analysis</TableHead>
                        <TableHead>Current Stage</TableHead>
                        <TableHead>Interview</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applicants?.applications?.map((item) => (
                        <tr key={item._id}>
                            <TableCell>{item?.applicant?.fullname}</TableCell>
                            <TableCell>{item?.applicant?.email}</TableCell>
                            <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                           <TableCell>
    {!item?.applicant?.profile?.resume ? (
        <span style={{
            fontSize: 11, fontWeight: 600, color: '#92400e',
            background: '#fef3c7', padding: '3px 10px',
            borderRadius: 99, border: '1px solid #fde68a'
        }}>
            No Resume
        </span>
    ) : item.matchScore !== null && item.matchScore !== undefined ? (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
            background: item.matchScore >= 75 ? '#d1fae5' : item.matchScore >= 50 ? '#dbeafe' : '#fee2e2',
            color:      item.matchScore >= 75 ? '#065f46' : item.matchScore >= 50 ? '#1e40af' : '#991b1b',
        }}>
            {item.matchScore >= 75 ? '🟢' : item.matchScore >= 50 ? '🔵' : '🔴'}
            {item.matchScore}%
        </span>
    ) : (
        <span style={{
            fontSize: 11, fontWeight: 600, color: '#6b7280',
            background: '#f3f4f6', padding: '3px 10px',
            borderRadius: 99, border: '1px solid #e5e7eb'
        }}>
            Pending Analysis
        </span>
    )}
</TableCell>

                            <TableCell>
                                {item.applicant?.profile?.resume
                                    ? <a className="text-blue-600 cursor-pointer hover:underline" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">{item?.applicant?.profile?.resumeOriginalName}</a>
                                    : <span className="text-gray-400">NA</span>
                                }
                            </TableCell>

                            <TableCell>
                                {item.applicant?.profile?.resume ? (
                                    <button
                                        onClick={() => analyzeResumeHandler(item._id, item?.applicant?.fullname)}
                                        disabled={loadingId === item._id}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            background: loadingId === item._id ? '#f5f3ff' : '#ede9fe',
                                            color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: 8,
                                            padding: '5px 12px', cursor: loadingId === item._id ? 'not-allowed' : 'pointer',
                                            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                                            opacity: loadingId === item._id ? 0.7 : 1
                                        }}
                                    >
                                        {loadingId === item._id
                                            ? <><Loader2 size={12} className="animate-spin" /> Analyzing...</>
                                            : <><Sparkles size={12} /> Analyze</>
                                        }
                                    </button>
                                ) : (
                                    <span style={{ fontSize: 12, color: '#9ca3af' }}>No resume</span>
                                )}
                            </TableCell>

                            <TableCell>{String(item?.status || "pending").replaceAll("_", " ")}</TableCell>
                            <TableCell>{item?.interviewAt ? new Date(item.interviewAt).toLocaleString() : "—"}</TableCell>
                            <TableCell>{item?.createdAt?.split("T")[0]}</TableCell>

                            <TableCell className="float-right cursor-pointer">
                                <Popover>
                                    <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                    <PopoverContent className="w-32">
                                        {shortlistingStatus.map((status, index) => (
                                            <div key={index} onClick={() => statusHandler(status, item?._id)} className="flex w-fit items-center my-2 cursor-pointer hover:text-purple-700">
                                                <span>{status.replace("_", " ")}</span>
                                            </div>
                                        ))}
                                    </PopoverContent>
                                </Popover>
                            </TableCell>
                        </tr>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default ApplicantsTable