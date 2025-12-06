'use client';

import * as React from "react"
import { Search, X, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function CitySelector({ 
  options = [], 
  value, 
  onValueChange, 
  placeholder = "Select city...",
  disabled = false,
  countryName = '',
  stateName = ''
}) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options.slice(0, 50)
    return options.filter((option) => {
      const label = typeof option === 'string' ? option : option.label || option.name
      return label.toLowerCase().includes(searchQuery.toLowerCase())
    }).slice(0, 50)
  }, [options, searchQuery])

  const selectedLabel = React.useMemo(() => {
    if (!value) return null
    const option = options.find(opt => {
      const optValue = typeof opt === 'string' ? opt : opt.value || opt.code
      return optValue === value
    })
    return typeof option === 'string' ? option : option?.label || option?.name || value
  }, [options, value])

  const handleSelect = (optValue) => {
    if (onValueChange) {
      onValueChange(optValue)
    }
    setOpen(false)
    setSearchQuery('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={cn(
          "flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          "text-left justify-between items-center",
          "hover:bg-accent hover:text-accent-foreground",
          !value && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 opacity-50" />
          {selectedLabel || placeholder}
        </span>
        <Search className="h-4 w-4 opacity-50" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Select City
            </DialogTitle>
            {(countryName || stateName) && (
              <DialogDescription className="text-sm text-muted-foreground">
                {[countryName, stateName].filter(Boolean).join(', ')}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="px-6 pt-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {filteredOptions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No cities found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredOptions.map((option) => {
                  const optValue = typeof option === 'string' ? option : option.value || option.code
                  const optLabel = typeof option === 'string' ? option : option.label || option.name
                  const isSelected = value === optValue
                  
                  return (
                    <button
                      key={optValue}
                      type="button"
                      onClick={() => handleSelect(optValue)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg text-sm",
                        "transition-colors duration-150",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                        isSelected && "bg-blue-50 text-blue-700 border border-blue-200"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 opacity-60" />
                        <span className="font-medium">{optLabel}</span>
                        {isSelected && (
                          <span className="ml-auto text-xs text-blue-600 font-semibold">Selected</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

