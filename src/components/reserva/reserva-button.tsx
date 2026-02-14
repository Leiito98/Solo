'use client'

// app/components/reserva/reserva-button.tsx
// Tiny Client Component — fires a DOM custom event to open ReservaDialog.
// Safe to use inside Server Components because it accepts only serializable props.

interface ReservaButtonProps {
  /** If provided, the dialog will pre-select this service and jump to step 2 */
  servicioId?: string
  /** Custom event name — must match the one passed to ReservaDialog (default: "open-reserva-dialog") */
  eventName?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function ReservaButton({
  servicioId,
  eventName = 'open-reserva-dialog',
  className,
  style,
  children,
}: ReservaButtonProps) {
  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { servicioId: servicioId ?? null },
      })
    )
  }

  return (
    <button onClick={handleClick} className={className} style={style}>
      {children}
    </button>
  )
}