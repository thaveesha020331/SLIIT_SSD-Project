import React from 'react'
import logoMark from '@/assets/log.jpg'
import { EcoMartWordmark } from './EcoMartWordmark'

/**
 * EcoMart mark from `src/assets/log.jpg`, optional wordmark.
 */
export function EcoMartLogo({
  className = '',
  size = 40,
  showWordmark = false,
  wordmarkClassName = '',
  wordmarkVariant = 'onLight',
}) {
  return (
    <span className={['inline-flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <img
        src={logoMark}
        alt="EcoMart"
        width={size}
        height={size}
        className="flex-shrink-0 rounded-2xl object-contain bg-white shadow-sm ring-1 ring-black/5"
        style={{ width: size, height: size }}
        decoding="async"
      />
      {showWordmark && (
        <EcoMartWordmark variant={wordmarkVariant} className={wordmarkClassName} />
      )}
    </span>
  )
}
