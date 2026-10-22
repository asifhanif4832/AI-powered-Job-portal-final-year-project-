import React from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'

export const DEFAULT_FILTERS = {
  Location: 'all',
  Industry: 'all',
  Salary: 'all',
}

const fallbackData = [
  { filterType: 'Location', array: ['Lahore', 'Karachi', 'Multan', 'Islamabad', 'Peshawar', 'Quetta'] },
  { filterType: 'Industry', array: ['Frontend Developer', 'Backend Developer', 'FullStack Developer'] },
  { filterType: 'Salary', array: ['0k-40k', '41k-1lakh', '1lakh-5lakh'] },
]

const FilterCard = ({
  selectedFilters = DEFAULT_FILTERS,
  onChange,
  onApply,
  onReset,
  filterData = fallbackData,
  showActions = false,
}) => {
  const changeHandler = (filterType, value) => {
    onChange?.(prev => ({ ...prev, [filterType]: value }))
  }

  return (
    <div className="w-full">
      <h2 className="text-base font-semibold text-slate-900">Filters</h2>
      <p className="mt-1 text-xs text-slate-500">Narrow results by location, role and salary</p>
      <div className="my-4 h-px bg-slate-200" />
      <div className="space-y-6">
        {filterData.map((data, index) => (
          <div key={index}>
            <h3 className="text-sm font-semibold text-slate-800">{data.filterType}</h3>
            <RadioGroup
              value={selectedFilters[data.filterType]}
              onValueChange={value => changeHandler(data.filterType, value)}
              className="mt-2 space-y-2"
            >
              {['All', ...data.array].map((item, idx) => {
                const itemId = `filter-${index}-${idx}`
                const value = item === 'All' ? 'all' : item
                return (
                  <Label
                    key={itemId}
                    htmlFor={itemId}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 text-sm text-slate-700 hover:bg-brand-50/80 has-[[data-state=checked]]:border-brand-200 has-[[data-state=checked]]:bg-brand-50"
                  >
                    <RadioGroupItem value={value} id={itemId} className="border-slate-300 text-brand-700" />
                    <span>{item}</span>
                  </Label>
                )
              })}
            </RadioGroup>
          </div>
        ))}
      </div>
      {showActions && (
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <Button type="button" variant="outline" onClick={onReset}>
            Clear
          </Button>
          <Button type="button" onClick={onApply}>
            Apply filters
          </Button>
        </div>
      )}
    </div>
  )
}

export default FilterCard
