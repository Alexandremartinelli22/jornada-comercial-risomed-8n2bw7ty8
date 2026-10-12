import React, { useState } from 'react'

export const RISOMED_LOGO_URL = '/logo-risomed.svg'

interface RisomedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  variant?: 'default' | 'white'
}

export function RisomedLogo({
  size = 'md',
  showText: _showText = true,
  className = '',
  variant = 'default',
}: RisomedLogoProps) {
  const [imgError, setImgError] = useState(false)

  // Height mappings for logo image
  const imgHeights = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-16',
  }

  // Fallback typographic logo if asset fails to load
  if (imgError) {
    return (
      <div className={`inline-flex flex-col select-none ${className}`}>
        <div className="flex items-baseline font-extrabold tracking-tight leading-[0.88] text-2xl font-heading">
          <div className="flex flex-col">
            <span className={variant === 'white' ? 'text-white' : 'text-[#00778B]'}>Riso</span>
            <div className="flex items-center">
              <span className={variant === 'white' ? 'text-white' : 'text-[#00778B]'}>med</span>
              <svg className="w-2.5 h-3.5 ml-0.5" viewBox="0 0 10 14" fill="none">
                <path
                  d="M2 2 C 7 6, 8 10, 3 13"
                  stroke={variant === 'white' ? '#FFFFFF' : '#00778B'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <span
          className={`text-[9px] font-semibold tracking-[0.2em] -mt-0.5 ${
            variant === 'white' ? 'text-white/80' : 'text-[#E87722]'
          }`}
        >
          odonto
        </span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={RISOMED_LOGO_URL}
        alt="Risomed odonto | Cuidamos das pessoas. Geramos resultados para empresas."
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
