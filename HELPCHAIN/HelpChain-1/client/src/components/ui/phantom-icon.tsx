export function PhantomIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="64" fill="#AB9FF2"/>
      <g>
        <path d="M110.584 64.9142H99.142C99.142 41.7651 80.173 23 56.7724 23C33.6612 23 14.8716 41.3057 14.4118 64.0583C13.936 87.5692 35.468 108 59.1756 108H63.0812C84.1747 108 110.584 89.3214 110.584 64.9142Z" fill="url(#paint0_linear_phantom)"/>
        <path d="M77.5853 67.1752C77.5853 71.2765 74.838 74.6024 71.4481 74.6024C68.0582 74.6024 65.3109 71.2765 65.3109 67.1752C65.3109 63.0739 68.0582 59.748 71.4481 59.748C74.838 59.748 77.5853 63.0739 77.5853 67.1752Z" fill="white"/>
        <path d="M95.2926 67.1752C95.2926 71.2765 92.5453 74.6024 89.1554 74.6024C85.7655 74.6024 83.0182 71.2765 83.0182 67.1752C83.0182 63.0739 85.7655 59.748 89.1554 59.748C92.5453 59.748 95.2926 63.0739 95.2926 67.1752Z" fill="white"/>
      </g>
      <defs>
        <linearGradient id="paint0_linear_phantom" x1="62.498" y1="23" x2="62.498" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#534BB1"/>
          <stop offset="1" stopColor="#551BF9"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
