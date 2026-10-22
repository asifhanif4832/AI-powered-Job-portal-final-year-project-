import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useSelector } from 'react-redux';

const AppliedJobTable = () => {
  const { allAppliedJobs } = useSelector(state => state.job);
  const { user } = useSelector(state => state.auth);

  // Filter only jobs applied by current user
  const userAppliedJobs = Array.isArray(allAppliedJobs)
    ? allAppliedJobs.filter(job => job.applicant?._id === user?._id || job.applicant === user?._id)
    : [];

  if (!userAppliedJobs || userAppliedJobs.length === 0) {
    return (
      <Table>
        <TableCaption>A list of your applied jobs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Job Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              You have not applied for any job yet
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableCaption>A list of your applied jobs</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Job Role</TableHead>
          <TableHead>Company</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userAppliedJobs.map((appliedJob) => (
          <TableRow key={appliedJob._id}>
            <TableCell>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
            <TableCell>{appliedJob.job?.title}</TableCell>
            <TableCell>{appliedJob.job?.company?.name}</TableCell>
            <TableCell className="text-right">
              <Badge
                className={`${
                  appliedJob?.status === 'rejected'
                    ? 'bg-red-400'
                    : appliedJob?.status === 'pending'
                    ? 'bg-gray-400'
                    : 'bg-green-400'
                }`}
              >
                {appliedJob?.status?.toUpperCase()}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AppliedJobTable;
