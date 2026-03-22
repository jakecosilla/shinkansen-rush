export const TrainSVGs = {};

const trainTypes = [
  { id: 'hayabusa', color: '#2ea668', stripe: '#ffffff', accent: '#e5005a', window: '#111111' },
  { id: 'doctoryellow', color: '#ffcc00', stripe: '#0033a0', accent: '#0033a0', window: '#111111' },
  { id: 'n700', color: '#ffffff', stripe: '#0033a0', accent: '#0033a0', window: '#222222' },
  { id: 'komachi', color: '#e60012', stripe: '#dddddd', accent: '#dddddd', window: '#111111' },
  { id: 'maglev', color: '#eeeeee', stripe: '#002266', accent: '#002266', window: '#111111' },
  { id: 'thomas', color: '#0055a5', stripe: '#cc0000', accent: '#cc0000', window: '#111111', isThomas: true }
];

trainTypes.forEach(t => {
  let head = `
    <!-- Head Car -->
    <rect x="0" y="0" width="100" height="140" rx="30" fill="${t.color}" />
    <polygon points="10,0 90,0 100,50 100,140 0,140 0,50" fill="${t.color}" />
    <rect x="35" y="0" width="30" height="140" fill="${t.stripe}" />
    ${t.id === 'hayabusa' ? `<rect x="45" y="0" width="10" height="140" fill="${t.accent}" />` : ''}
    <path d="M 20 50 Q 50 -10 80 50 L 70 80 L 30 80 Z" fill="${t.window}" />
  `;

  if (t.isThomas) {
    head = `
    <!-- Head Car (Thomas) -->
    <rect x="0" y="0" width="100" height="140" rx="40" fill="${t.color}" />
    <rect x="10" y="0" width="80" height="140" fill="${t.color}" />
    <rect x="25" y="0" width="50" height="140" fill="${t.stripe}" />
    <circle cx="50" cy="50" r="40" fill="#cccccc" />
    <!-- Eyes -->
    <circle cx="35" cy="45" r="5" fill="#111111" />
    <circle cx="65" cy="45" r="5" fill="#111111" />
    <!-- Smile -->
    <path d="M 35 65 Q 50 80 65 65" stroke="#111111" stroke-width="3" fill="none" />
    `;
  }

  let mid = `
    <!-- Mid Car -->
    <rect x="0" y="150" width="100" height="140" fill="${t.color}" />
    <rect x="35" y="150" width="30" height="140" fill="${t.stripe}" />
    ${t.id === 'hayabusa' ? `<rect x="45" y="150" width="10" height="140" fill="${t.accent}" />` : ''}
    <!-- Windows -->
    <rect x="10" y="160" width="15" height="120" fill="${t.window}" />
    <rect x="75" y="160" width="15" height="120" fill="${t.window}" />
  `;

  let tail = `
    <!-- Tail Car -->
    <rect x="0" y="300" width="100" height="140" rx="30" fill="${t.color}" />
    <polygon points="10,440 90,440 100,390 100,300 0,300 0,390" fill="${t.color}" />
    <rect x="35" y="300" width="30" height="140" fill="${t.stripe}" />
    ${t.id === 'hayabusa' ? `<rect x="45" y="300" width="10" height="140" fill="${t.accent}" />` : ''}
    <path d="M 20 390 Q 50 450 80 390 L 70 360 L 30 360 Z" fill="${t.window}" />
  `;

  if (t.isThomas) {
    tail = `
    <!-- Tail Car (Thomas back) -->
    <rect x="0" y="300" width="100" height="140" rx="20" fill="${t.color}" />
    <rect x="25" y="300" width="50" height="140" fill="${t.stripe}" />
    `;
  }

  if (t.id === 'maglev') {
    head = `
    <!-- Maglev L0 Aerodynamic Head -->
    <polygon points="35,0 65,0 90,80 100,140 0,140 10,80" fill="${t.color}" />
    <!-- Signature blue multi-stripe on top -->
    <polygon points="45,10 55,10 65,140 35,140" fill="${t.stripe}" />
    <polygon points="38,20 42,20 28,140 24,140" fill="${t.stripe}" />
    <polygon points="62,20 58,20 72,140 76,140" fill="${t.stripe}" />
    <!-- Very small cockpit window -->
    <path d="M 43 70 L 57 70 L 53 85 L 47 85 Z" fill="${t.window}" />
    `;

    mid = `
    <!-- Maglev Mid Car -->
    <rect x="0" y="150" width="100" height="140" fill="${t.color}" />
    <!-- Continuing the multi-stripe pattern -->
    <rect x="35" y="150" width="30" height="140" fill="${t.stripe}" />
    <rect x="24" y="150" width="4" height="140" fill="${t.stripe}" />
    <rect x="72" y="150" width="4" height="140" fill="${t.stripe}" />
    <!-- Slim, tiny side windows characteristic of maglev -->
    <rect x="8" y="160" width="4" height="120" fill="${t.window}" />
    <rect x="88" y="160" width="4" height="120" fill="${t.window}" />
    `;

    tail = `
    <!-- Maglev Tail Car (Reverse of head) -->
    <polygon points="0,300 100,300 90,360 65,440 35,440 10,360" fill="${t.color}" />
    <polygon points="35,300 65,300 55,430 45,430" fill="${t.stripe}" />
    <polygon points="24,300 28,300 42,420 38,420" fill="${t.stripe}" />
    <polygon points="76,300 72,300 58,420 62,420" fill="${t.stripe}" />
    <path d="M 47 355 L 53 355 L 57 370 L 43 370 Z" fill="${t.window}" />
    `;
  }

  TrainSVGs[t.id] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 450">
    <g>
      <!-- Base Shadow -->
      <rect x="0" y="0" width="100" height="440" rx="20" fill="rgba(0,0,0,0.3)" transform="translate(5, 5)" />
      
      <!-- Cars -->
      ${head}
      ${mid}
      ${tail}
      
      <!-- Connecting joints -->
      <rect x="40" y="140" width="20" height="10" fill="#222" />
      <rect x="40" y="290" width="20" height="10" fill="#222" />
    </g>
  </svg>`;
});
