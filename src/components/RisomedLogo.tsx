import React, { useState } from 'react'

export const RISOMED_LOGO_URL = '/logo-risomed.svg'
export const RISOMED_LOGO_WHITE_URL = '/logo-risomed-white.svg'
export const RISOMED_SYMBOL_URL = '/logo-risomed-symbol.svg'

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

  // Alturas para cada tamanho
  const imgHeights = {
    sm: 'h-6',
    md: 'h-9',
    lg: 'lg:h-12 h-10',
    xl: 'h-14',
  }

  const logoSrc = variant === 'white' ? RISOMED_LOGO_WHITE_URL : RISOMED_LOGO_URL
  const textColor = variant === 'white' ? '#FFFFFF' : '#1B2E5A'

  // Fallback vetorial inline garantido e auto-suficiente caso a imagem externa falhe
  if (imgError) {
    const fallbackSizes = {
      sm: { w: 120, h: 44, fontSize: 24, strokeWidth: 2.2 },
      md: { w: 150, h: 55, fontSize: 30, strokeWidth: 2.6 },
      lg: { w: 190, h: 70, fontSize: 38, strokeWidth: 3.2 },
      xl: { w: 220, h: 80, fontSize: 44, strokeWidth: 3.6 },
    }
    const cfg = fallbackSizes[size]

    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <svg
          viewBox="0 0 220 80"
          width={cfg.w}
          height={cfg.h}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Risomed"
          className="w-auto h-auto"
        >
          {/* Wordmark puro em uma palavra só */}
          <text
            x="14"
            y="45"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="700"
            fontSize="39"
            fill={textColor}
            letterSpacing="-0.02em"
          >
            Risomed
          </text>
          {/* Grande arco de sorriso elegante */}
          <path
            d="M 19 51 C 28 65, 62 72, 105 72 C 148 72, 175 66, 191 61"
            stroke={textColor}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="Risomed | Cuidamos das pessoas. Geramos resultados para empresas."
        className={`${imgHeights[size]} w-auto object-contain transition-all`}
        onError={() => setImgError(true)}
        loading="eager"
      />
    </div>
  )
}

export default RisomedLogo
