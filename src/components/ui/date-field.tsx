/* eslint-disable react-hooks/set-state-in-effect */
import { Calendar } from '@/components/ui/calendar'
import { FloatingLabelInput } from '@/components/ui/floating-input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
// import { messages } from '@/config/messages'
import { cn } from '@/lib/utils'
import { format, parse, setHours, setMinutes } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { ChangeEvent, useEffect, useState, useCallback, forwardRef } from 'react'
import { toast } from 'sonner'

// Types for DateField component props
interface DateFieldProps {
  name: string
  label?: string
  className?: string
  value: Date | null
  onChange: (date: Date | null) => void
  disabled?: boolean
  readOnly?: boolean
  floatingLabel?: boolean
  fromYear?: number
  toYear?: number
  disableFuture?: boolean
  error?: boolean
  showTime?: boolean //for time selection
  iconClass?: string
  placeholder?: string
  disablePastFrom?: Date | null
  disableFutureFrom?: Date | null
}

/**
 * DateField Component for selecting dates with optional time selection.
 * Supports features like locked year, disabling future/past dates, and custom formatting.
 *
 * @param {DateFieldProps} props - Component props
 * @returns {JSX.Element} The rendered DateField component
 */
export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  ({ value, label, className, onChange, showTime = false, placeholder, ...rest }, ref) => {
    const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [inputValue, setInputValue] = useState<string>(value ? format(value, 'dd-MM-yyyy') : '')
    const lockedYear =
      rest.fromYear !== undefined &&
        rest.toYear !== undefined &&
        rest.fromYear === rest.toYear
        ? rest.fromYear
        : undefined

    // Time picker states
    const [hour, setHour] = useState<number>(value ? value.getHours() % 12 || 12 : 12)
    const [minute, setMinute] = useState<number>(value ? value.getMinutes() : 0)
    const [isPM, setIsPM] = useState<boolean>(value ? value.getHours() >= 12 : false)
    const calendarCaptionLayout = lockedYear !== undefined ? 'dropdown-months' : 'dropdown'
    const calendarStartMonth =
      lockedYear !== undefined ? new Date(lockedYear, 0, 1) : undefined
    const calendarEndMonth =
      lockedYear !== undefined ? new Date(lockedYear, 11, 31) : new Date(new Date().getFullYear() + 5, 11)

    // Adjust calendar end month if disableFutureFrom is set and falls within the calendar range
    const handleDateChange = (date: Date | undefined) => {
      try {
        if (date) {
          let finalDate = date

          if (lockedYear !== undefined) {
            finalDate = new Date(date)
            finalDate.setFullYear(lockedYear)
          }

          if (showTime) {
            const adjustedHour = (hour % 12) + (isPM ? 12 : 0)
            finalDate = setHours(setMinutes(finalDate, minute), adjustedHour)
          }

          const formattedDate = format(
            finalDate,
            showTime ? 'dd-MM-yyyy hh:mm a' : 'dd-MM-yyyy'
          )

          setInputValue(formattedDate)
          onChange(finalDate)
          setCalendarOpen(false)
        } else {
          setInputValue('')
          onChange(null)
          setCalendarOpen(false)
        }
      } catch (error) {
        console.error(error)
        toast.error('Please select a valid date')
      }
    }

    // Handle manual input changes
    const handleInputChange = (
      e: ChangeEvent<HTMLInputElement>
    ) => {
      try {
        const digits = e.target.value
          .replace(/[^0-9]/g, '')
          .slice(0, 8)

        let formattedValue = ''

        if (lockedYear !== undefined) {
          const year = String(lockedYear)
          const day = digits.slice(0, 2)
          const month = digits.slice(2, 4)

          if (digits.length <= 2) {
            formattedValue = day
          } else if (digits.length <= 4) {
            formattedValue = [day, month].filter(Boolean).join('-')
          } else {
            formattedValue = `${[day, month].filter(Boolean).join('-')}-${year}`
          }
        } else {
          let value = digits

          if (value.length > 4) {
            let year = value.slice(4, 8)

            if (year.length > 0 && !['1', '2'].includes(year[0])) {
              year = '2' + year.slice(1)
            }

            value = value.slice(0, 4) + year
          }

          formattedValue = value.replace(
            /^(\d{2})(\d{0,2})(\d{0,4})$/,
            (_, d, m, y) => [d, m, y].filter(Boolean).join('-')
          )
        }

        setInputValue(formattedValue)

        if (datePattern.test(formattedValue)) {
          let parsedDate = parse(
            formattedValue,
            'dd-MM-yyyy',
            new Date()
          )

          if (lockedYear !== undefined) {
            parsedDate.setFullYear(lockedYear)
          }

          if (rest.disableFuture && parsedDate > new Date()) {
            onChange(null)
            return
          }

          if (showTime) {
            const adjustedHour = (hour % 12) + (isPM ? 12 : 0)

            parsedDate = setHours(
              setMinutes(parsedDate, minute),
              adjustedHour
            )

            setInputValue(
              format(parsedDate, 'dd-MM-yyyy hh:mm a')
            )
          }

          onChange(parsedDate)
        } else {
          onChange(null)
        }
      } catch (error) {
        console.error(error)
        toast.error('Please select a valid date')
        onChange(null)
      }
    }

    // Sync input value with external changes to value prop
    useEffect(() => {
      if (value) {
        const formattedDate = format(value, showTime ? 'dd-MM-yyyy hh:mm a' : 'dd-MM-yyyy')
        setInputValue(formattedDate)
        if (showTime) {
          setHour(value.getHours() % 12 || 12)
          setMinute(value.getMinutes())
          setIsPM(value.getHours() >= 12)
        }
      }
    }, [value, showTime])

    return (
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <div className="relative">
          <FloatingLabelInput
            id={label}
            label={label}
            value={inputValue}
            onChange={handleInputChange}
            pattern={datePattern.source}
            placeholder={placeholder ?? ''}
            disabled={rest.disabled}
            readOnly={rest.readOnly}
            error={rest.error}
            aria-label={rest.name}
            aria-readonly={rest.readOnly}
            className={cn(
              className,
              rest.readOnly &&
              'bg-muted/40 text-muted-foreground border-dashed cursor-not-allowed pr-10 focus-visible:ring-0'
            )}
            ref={ref}
          />
          <PopoverTrigger asChild disabled={rest.disabled}>
            <CalendarIcon
              aria-label="Open Calendar"
              className={cn(
                'h-7 w-7 absolute text-primary right-1 top-1/2 -translate-y-1/2 px-1.5 cursor-pointer',
                rest.disabled && 'text-primary/40 cursor-not-allowed',
                rest.readOnly && 'text-muted-foreground/70',
                rest.iconClass ?? ''
              )}
              onClick={(e) => {
                e.preventDefault()
                if (!rest.disabled) {
                  setCalendarOpen(true)
                }
              }}
            />
          </PopoverTrigger>
        </div>

        {rest.readOnly && lockedYear !== undefined && (
          <p className="mt-1 text-xs text-muted-foreground">
            Year locked to {lockedYear}. You can still change the day and month.
          </p>
        )}

        <PopoverContent className="w-auto p-0 flex gap-4" align="end">
          <Calendar
            mode="single"
            captionLayout={calendarCaptionLayout}
            selected={value || undefined}
            defaultMonth={value || undefined}
            onSelect={handleDateChange}
            startMonth={calendarStartMonth}
            endMonth={calendarEndMonth}
            //logic modified
            disabled={(date) => {
              let status = false
              if (rest.disableFutureFrom && date >= rest.disableFutureFrom) {
                status = true
              }

              if (rest.disablePastFrom) {
                // allow same day only for start date, block same day for end date
                const isSameDay = date.toDateString() === rest.disablePastFrom.toDateString()

                if (date < rest.disablePastFrom || isSameDay) {
                  status = true
                }
              }

              if (rest.disableFuture && date > new Date()) {
                status = true
              }
              return status
            }}
          />

          {showTime && (
            <div className="flex flex-col items-center justify-center p-2">
              {/* AM / PM Toggle */}
              <div className="flex items-center gap-2 mb-2">
                <span>AM</span>
                <Switch checked={isPM} onCheckedChange={(checked) => setIsPM(checked)} />
                <span>PM</span>
              </div>

              {/* Hour / Minute Pickers */}
              <div className="flex gap-2">
                <div className="flex flex-col border rounded p-1 h-64 custom-scrollbar overflow-y-auto">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <div
                      key={h}
                      onClick={() => setHour(h)}
                      className={cn(
                        'cursor-pointer px-2 py-1',
                        hour === h && 'bg-primary text-white rounded'
                      )}
                    >
                      {String(h).padStart(2, '0')}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col border rounded p-1 h-64 custom-scrollbar overflow-y-auto">
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <div
                      key={m}
                      onClick={() => setMinute(m)}
                      className={cn(
                        'cursor-pointer px-2 py-1',
                        minute === m && 'bg-primary text-white rounded'
                      )}
                    >
                      {String(m).padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    )
  }
)

DateField.displayName = 'DateField';
