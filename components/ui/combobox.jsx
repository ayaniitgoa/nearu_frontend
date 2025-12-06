import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Combobox = React.forwardRef(
  ({ 
    options = [], 
    value, 
    onValueChange, 
    onSearchChange,
    placeholder = "Search...", 
    className,
    disabled = false,
    emptyMessage = "No results found"
  }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const inputRef = React.useRef(null)
    const dropdownRef = React.useRef(null)

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options.slice(0, 10)
      return options.filter((option) => {
        const label = typeof option === 'string' ? option : option.label || option.name
        return label.toLowerCase().includes(searchQuery.toLowerCase())
      }).slice(0, 10)
    }, [options, searchQuery])

    const selectedLabel = React.useMemo(() => {
      if (!value && value !== 0) return ''
      const option = options.find(opt => {
        const optValue = typeof opt === 'string' ? opt : opt.value || opt.code
        return String(optValue) === String(value)
      })
      return typeof option === 'string' ? option : option?.label || option?.name || value
    }, [options, value])

    React.useEffect(() => {
      if (!open) return
      
      const handleClickOutside = (event) => {
        // Check if click is outside both input and dropdown
        const isClickInInput = inputRef.current?.contains(event.target)
        const isClickInDropdown = dropdownRef.current?.contains(event.target)
        
        if (!isClickInInput && !isClickInDropdown) {
          setOpen(false)
          if (value) {
            setSearchQuery('')
          }
        }
      }
      
      // Use setTimeout to allow click events to fire first
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside)
      }, 0)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [open, value])

    // Reset search query when value changes externally
    React.useEffect(() => {
      if (!open && value) {
        setSearchQuery('')
      }
    }, [value, open])

    return (
      <div className={cn("relative", className)} ref={ref}>
        <div className="relative">
            <input
            ref={inputRef}
            type="text"
            value={open ? searchQuery : selectedLabel}
            onChange={(e) => {
              const newQuery = e.target.value
              setSearchQuery(newQuery)
              if (onSearchChange) {
                onSearchChange(newQuery)
              }
              if (!open) setOpen(true)
            }}
            onFocus={() => {
              setOpen(true)
              setSearchQuery('')
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 pr-10 text-sm ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              open && "ring-2 ring-ring"
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setOpen(!open)
            }}
            disabled={disabled}
          >
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </div>
        {open && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95"
          >
            <div className="max-h-60 overflow-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const optValue = typeof option === 'string' ? option : option.value || option.code
                  const optLabel = typeof option === 'string' ? option : option.label || option.name
                  const isSelected = String(value) === String(optValue)
                  
                  return (
                    <div
                      key={optValue}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm",
                        "outline-none hover:bg-accent hover:text-accent-foreground",
                        "focus:bg-accent focus:text-accent-foreground",
                        isSelected && "bg-accent"
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (onValueChange && optValue !== undefined && optValue !== null) {
                          onValueChange(optValue)
                        }
                        setOpen(false)
                        setSearchQuery('')
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {optLabel}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)
Combobox.displayName = "Combobox"

export { Combobox }

