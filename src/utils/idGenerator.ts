// Helper to generate realistic visual ID & Passport SVG data URLs for hotel guests

export function generateSampleIdCardSvg(options: {
  guestName: string;
  idNumber: string;
  nationality: string;
  docType: 'CAMBODIA_ID' | 'PASSPORT';
  source: 'CAMERA' | 'SCANNER';
}): string {
  const { guestName, idNumber, nationality, docType, source } = options;
  const isKhmer = docType === 'CAMBODIA_ID';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${isKhmer ? '#0C1B33' : '#111B3A'}" />
        <stop offset="50%" stop-color="${isKhmer ? '#1A335E' : '#1E293B'}" />
        <stop offset="100%" stop-color="${isKhmer ? '#091324' : '#0F172A'}" />
      </linearGradient>
      <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 0 20 Q 20 0 40 20 T 80 20" fill="none" stroke="rgba(201,169,110,0.12)" stroke-width="1.2"/>
        <path d="M 20 0 Q 40 20 20 40 T 20 80" fill="none" stroke="rgba(216,27,115,0.08)" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Card Background -->
    <rect x="10" y="10" width="780" height="480" rx="24" fill="url(#bgGrad)" stroke="#C9A96E" stroke-width="3.5" />
    <rect x="10" y="10" width="780" height="480" rx="24" fill="url(#guilloche)" />

    <!-- Header Bar -->
    <rect x="25" y="25" width="750" height="65" rx="14" fill="rgba(37, 59, 115, 0.7)" stroke="rgba(201,169,110,0.3)" />
    
    <!-- Flag / Emblem Symbol -->
    <circle cx="65" cy="57" r="22" fill="#D81B73" stroke="#C9A96E" stroke-width="2" />
    <text x="65" y="63" font-size="18" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif">★</text>

    <text x="100" y="48" fill="#C9A96E" font-size="15" font-weight="bold" font-family="sans-serif" letter-spacing="1">
      ${isKhmer ? 'KINGDOM OF CAMBODIA • NATIONAL IDENTITY CARD' : 'INTERNATIONAL TRAVEL DOCUMENT • PASSPORT'}
    </text>
    <text x="100" y="72" fill="#E2E8F0" font-size="13" font-family="sans-serif">
      ${isKhmer ? 'ព្រះរាជាណាចក្រកម្ពុជា • អត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ' : 'MINISTRY OF FOREIGN AFFAIRS • OFFICIAL IDENTIFICATION'}
    </text>

    <!-- Photo Frame -->
    <rect x="45" y="115" width="200" height="250" rx="16" fill="#1E293B" stroke="#D81B73" stroke-width="2.5" />
    <circle cx="145" cy="205" r="48" fill="#334155" />
    <path d="M 95 320 Q 145 270 195 320 Z" fill="#334155" />
    <text x="145" y="212" font-size="34" text-anchor="middle" fill="#94A3B8" font-family="sans-serif">👤</text>
    
    <rect x="55" y="335" width="180" height="22" rx="6" fill="#D81B73" opacity="0.9"/>
    <text x="145" y="350" font-size="10" font-weight="bold" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif">
      VERIFIED GUEST ID
    </text>

    <!-- Guest Information Fields -->
    <text x="275" y="140" fill="#94A3B8" font-size="11" font-family="sans-serif" font-weight="600">DOCUMENT NO. / លេខសម្គាល់</text>
    <text x="275" y="172" fill="#F8FAFC" font-size="22" font-weight="bold" font-family="monospace" letter-spacing="2">${idNumber}</text>

    <text x="275" y="210" fill="#94A3B8" font-size="11" font-family="sans-serif" font-weight="600">FULL NAME / គោត្តនាម និងនាម</text>
    <text x="275" y="240" fill="#F8FAFC" font-size="19" font-weight="bold" font-family="sans-serif">${guestName.toUpperCase()}</text>

    <text x="275" y="278" fill="#94A3B8" font-size="11" font-family="sans-serif" font-weight="600">NATIONALITY / សញ្ជាតិ</text>
    <text x="275" y="305" fill="#38BDF8" font-size="15" font-weight="bold" font-family="sans-serif">${nationality.toUpperCase()}</text>

    <text x="540" y="278" fill="#94A3B8" font-size="11" font-family="sans-serif" font-weight="600">INTAKE SOURCE / ប្រភព</text>
    <text x="540" y="305" fill="#34D399" font-size="13" font-weight="bold" font-family="monospace">
      ${source === 'CAMERA' ? '📷 MOBILE CAMERA' : '🖨️ FLATBED SCAN'}
    </text>

    <!-- Stamp & Security Seal -->
    <circle cx="680" cy="190" r="45" fill="none" stroke="#C9A96E" stroke-width="2" stroke-dasharray="4 2" />
    <text x="680" y="185" font-size="9" text-anchor="middle" fill="#C9A96E" font-family="sans-serif" font-weight="bold">GALAXY STAR ANGKOR</text>
    <text x="680" y="198" font-size="8" text-anchor="middle" fill="#C9A96E" font-family="sans-serif">HOTEL</text>
    <text x="680" y="210" font-size="7" text-anchor="middle" fill="#34D399" font-family="sans-serif">VERIFIED</text>

    <!-- Machine Readable Zone (MRZ) -->
    <rect x="25" y="390" width="750" height="80" rx="12" fill="#070D18" stroke="rgba(201,169,110,0.4)" />
    <text x="45" y="425" fill="#C9A96E" font-size="16" font-family="monospace" letter-spacing="3">
      ${isKhmer ? 'IDKHM' : 'P<GBR'}${idNumber.padEnd(24, '<')}
    </text>
    <text x="45" y="455" fill="#C9A96E" font-size="16" font-family="monospace" letter-spacing="3">
      9008246M3008248KHM<<<<<<<<<<<<<<4${guestName.replace(/[^A-Za-z]/g, '<').toUpperCase().padEnd(20, '<')}
    </text>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
