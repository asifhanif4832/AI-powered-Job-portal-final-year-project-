import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { setCompanies } from '@/redux/companySlice'

const CompaniesTable = () => {
  const { companies, searchCompanyByText } = useSelector(store => store.company)
  const [filterCompany, setFilterCompany] = useState(companies)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const filteredCompany = companies.filter(company => {
      if (!searchCompanyByText) return true
      return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase())
    })
    setFilterCompany(filteredCompany)
  }, [companies, searchCompanyByText])

  // ✅ DELETE COMPANY
  const deleteCompanyHandler = async (companyId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this company?")
    if (!confirmDelete) return

    try {
      const res = await axios.delete(
        `${COMPANY_API_END_POINT}/delete/${companyId}`,
        { withCredentials: true }
      )

      if (res.data.success) {
        toast.success(res.data.message)

        const updatedCompanies = companies.filter(
          company => company._id !== companyId
        )
        dispatch(setCompanies(updatedCompanies))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete company")
    }
  }

  return (
    <div>
      <Table>
        <TableCaption>A list of your recent registered companies</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filterCompany?.map(company => (
            <TableRow key={company._id}>
              <TableCell>
                <Avatar>
                  <AvatarImage src={company.logo} />
                </Avatar>
              </TableCell>

              <TableCell>{company.name}</TableCell>
              <TableCell>{company.createdAt.split("T")[0]}</TableCell>

              <TableCell className="text-right">
                <Popover>
                  <PopoverTrigger className="cursor-pointer">
                    <MoreHorizontal />
                  </PopoverTrigger>

                  <PopoverContent className="w-40">
                    <div
                      onClick={() => navigate(`/admin/companies/${company._id}`)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="w-4" />
                      <span>Edit</span>
                    </div>

                    {/* ✅ DELETE */}
                    <div
                      onClick={() => deleteCompanyHandler(company._id)}
                      className="flex items-center gap-2 cursor-pointer mt-2 text-red-600"
                    >
                      <Trash2 className="w-4" />
                      <span>Delete</span>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default CompaniesTable
