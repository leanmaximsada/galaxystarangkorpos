import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'monochrome-dark' | 'monochrome-light' | 'print';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  isKhmer?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  showSubtitle = true,
  className = '',
  isKhmer = false,
}) => {
  const sizeClasses = {
    sm: { icon: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-base', sub: 'text-[11px]' },
    lg: { icon: 'w-14 h-14', text: 'text-xl', sub: 'text-xs' },
    xl: { icon: 'w-20 h-20', text: 'text-2xl', sub: 'text-sm' },
  }[size];

  const isLightText = variant === 'monochrome-light' || variant === 'full';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Hotel Logo */}
      <div className={`relative shrink-0 ${sizeClasses.icon} flex items-center justify-center`}>
        <img
          src="/logo.png"
          alt="Galaxy Star Angkor Hotel Logo"
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span 
            className={`font-brand font-bold tracking-wider leading-tight ${sizeClasses.text} ${
              variant === 'monochrome-dark' || variant === 'print' ? 'text-[#111B3A]' : 'text-white'
            }`}
          >
            {isKhmer ? 'ហ្គាឡាក់ស៊ី ស្តារ អង្គរ' : 'GALAXY STAR ANGKOR'}
          </span>
          {/* <span className="text-[#D81B73] font-bold text-xs">★</span> */}
        </div>
        
        <div className="flex items-center gap-2">
          <span 
            className={`tracking-widest uppercase font-semibold ${sizeClasses.sub} ${
              variant === 'monochrome-dark' || variant === 'print' ? 'text-[#253B73]' : 'text-[#C9A96E]'
            }`}
          >
            {isKhmer ? 'សណ្ឋាគារ & ភោជនីយដ្ឋាន' : 'HOTEL & RESTAURANT'}
          </span>
        </div>
        
        {showSubtitle && size !== 'sm' && (
          <span className={`text-[9px] tracking-normal ${
            variant === 'monochrome-dark' || variant === 'print' ? 'text-gray-500' : 'text-gray-300/80'
          }`}>
            {isKhmer ? 'ខេត្តសៀមរាប • ព្រះរាជាណាចក្រកម្ពុជា' : 'Siem Reap • Kingdom of Cambodia'}
          </span>
        )}
      </div>
    </div>
  );
};
