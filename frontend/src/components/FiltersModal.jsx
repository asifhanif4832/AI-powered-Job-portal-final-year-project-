import React from 'react'
import FilterCard from './FilterCard'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'

const FiltersModal = ({
  open,
  onOpenChange,
  selectedFilters,
  onChange,
  onApply,
  onReset,
  filterData,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogDescription>Apply filters to narrow job results quickly.</DialogDescription>
        </DialogHeader>
        <FilterCard
          selectedFilters={selectedFilters}
          onChange={onChange}
          onApply={onApply}
          onReset={onReset}
          filterData={filterData}
          showActions
        />
      </DialogContent>
    </Dialog>
  )
}

export default FiltersModal
