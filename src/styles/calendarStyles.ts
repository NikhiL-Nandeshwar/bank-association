// React/Typescript
import { DayPickerProps, getDefaultClassNames } from 'react-day-picker'
import { cn } from '@/lib/utils'

// Custom components
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'

// Type-safe variant and captionLayout
type ButtonVariant = React.ComponentProps<typeof Button>['variant']
type CaptionLayout = NonNullable<DayPickerProps['captionLayout']>

/**
 * Generates ShadCN-compatible class names for the DayPicker calendar.
 * Supports custom button variants, caption layout modes, and optional overrides.
 * Returns a structured object for use in the `classNames` prop of <DayPicker />.
 */
export function getCalendarClassNames(
  buttonVariant: ButtonVariant = 'ghost',
  captionLayout: CaptionLayout = 'label',
  overrideClassNames?: Partial<ReturnType<typeof getDefaultClassNames>>
) {
  const defaultClassNames = getDefaultClassNames()

  return {
    // ───── 1. Layout ─────
    root: cn('w-fit', defaultClassNames.root),
    months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
    month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
    table: 'w-full border-collapse',

    // ───── 2. Navigation & Caption ─────
    nav: cn(
      'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
      defaultClassNames.nav
    ),
    button_previous: cn(
      buttonVariants({ variant: buttonVariant }),
      'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50',
      defaultClassNames.button_previous
    ),
    button_next: cn(
      buttonVariants({ variant: buttonVariant }),
      'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50',
      defaultClassNames.button_next
    ),
    month_caption: cn(
      'flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]',
      defaultClassNames.month_caption
    ),
    caption_label: cn(
      'select-none font-medium',
      captionLayout === 'label'
        ? 'text-sm'
        : '[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5',
      defaultClassNames.caption_label
    ),

    // ───── 3. Dropdowns ─────
    dropdowns: cn(
      'flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium',
      defaultClassNames.dropdowns
    ),
    dropdown_root: cn(
      'has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border',
      defaultClassNames.dropdown_root
    ),
    dropdown: cn('absolute inset-0 opacity-0', defaultClassNames.dropdown),

    // ───── 4. Weekdays/Numbers ─────
    weekdays: cn('flex', defaultClassNames.weekdays),
    weekday: cn(
      'text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal',
      defaultClassNames.weekday
    ),
    week: cn('mt-2 flex w-full', defaultClassNames.week),
    week_number_header: cn('w-[--cell-size] select-none', defaultClassNames.week_number_header),
    week_number: cn(
      'text-muted-foreground select-none text-[0.8rem]',
      defaultClassNames.week_number
    ),

    // ───── 5. Days ─────
    day: cn(
      'group/day relative aspect-square h-full w-full select-none p-0 text-center',
      '[&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md',
      defaultClassNames.day
    ),
    range_start: cn('bg-accent rounded-l-md', defaultClassNames.range_start),
    range_middle: cn('rounded-none', defaultClassNames.range_middle),
    range_end: cn('bg-accent rounded-r-md', defaultClassNames.range_end),
    today: cn(
      'bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none',
      defaultClassNames.today
    ),

    // ───── 6. Misc ─────
    outside: cn(
      'text-muted-foreground aria-selected:text-muted-foreground',
      defaultClassNames.outside
    ),
    disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
    hidden: cn('invisible', defaultClassNames.hidden),

    // ───── 7. Allow caller overrides ─────
    ...overrideClassNames,
  }
}
