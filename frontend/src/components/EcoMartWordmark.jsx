import React from 'react'

/**
 * Simple brand text aligned with site UI: Inter-style sans, gray + lime (light) or white + lime (dark).
 */
export function EcoMartWordmark({ variant = 'onLight', className = '' }) {
  const onDark = variant === 'onDark'

  return (
    <span
      className={[
        'inline-block text-lg sm:text-xl font-semibold tracking-tight',
        'font-[Inter,ui-sans-serif,system-ui,sans-serif]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={onDark ? 'text-white' : 'text-gray-900'}>Eco</span>
      <span className={onDark ? 'text-lime-400' : 'text-lime-700'}>Mart</span>
    </span>
  )
}
