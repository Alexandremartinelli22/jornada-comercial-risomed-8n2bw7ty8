import React, { useState } from 'react'

export const RISOMED_LOGO_URL =
  'https://risomed.com.br/wp-content/uploads/2026/08/logo_risomed.webp'

interface RisomedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  variant?: 'default' | 'white'
}

export function RisomedLogo({
  size = 'md',
  showText = true,
  className = '',
  variant = 'default',
}: RisomedLogoProps) {
  const [imgError, setImgError] = useState(false)

  // Height mappings for logo image
  const imgHeights = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-11',
    xl: 'h-14',
  }

  // Fallback typographic logo if webp network is blocked/offline
  if (imgError) {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        <div className="flex items-center font-black tracking-tight leading-none text-2xl font-heading">
          <span className={variant === 'white' ? 'text-white' : 'text-[#1B2E5A]'}>Riso</span>
          <span className="text-[#29AABE]">med,</span>
          <span className="text-[#F58220] text-xs font-bold ml-1 uppercase tracking-wider self-end mb-0.5">
            odonto
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <img
        src={RISOMED_LOGO_URL}
        alt="Risomed | Saúde e Odonto Corporativo"
        className={`${imgHeights[size]} w-auto object-contain transition-all ${
          variant === 'white' ? 'brightness-0 invert' : ''
        }`}
        onError={() => setImgError(true)}
        loading="eager"
      />
    </div>
  )
}
export default RisomedLogo
