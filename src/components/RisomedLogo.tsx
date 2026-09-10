import React from 'react'

interface RisomedLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
}

export const RisomedLogo: React.FC<RisomedLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const heights = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon: Cross + Heart Wave (Saúde & Prevenção) */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#003882] to-[#0052be] p-2 text-white shadow-sm shadow-[#003882]/20 ${heights[size]}`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
        >
          {/* Medical Cross with rounded edges */}
          <rect x="13" y="4" width="6" height="24" rx="3" fill="#FFFFFF" />
          <rect x="4" y="13" width="24" height="6" rx="3" fill="#FFFFFF" />
          {/* Pulse / Vital Curve in Vibrant Green */}
          <path
            d="M5 16H10L12.5 10L16 22L19.5 13L22 16H27"
            stroke="#00A859"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center font-extrabold tracking-tight">
          <span className="text-[#003882] text-xl font-black tracking-tight leading-none">
            RISO
          </span>
          <span className="text-[#00A859] text-xl font-black tracking-tight leading-none">MED</span>
        </div>
        {showSubtitle && (
          <span className="text-[9.5px] uppercase font-bold tracking-widest text-[#64748B] mt-0.5 leading-none">
            Jornada Comercial
          </span>
        )}
      </div>
    </div>
  )
}
