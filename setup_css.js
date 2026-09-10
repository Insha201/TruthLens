const fs = require('fs');

const indexCss = `
@import "tailwindcss";

@layer base {
  :root, html, body {
    --bg-primary: #040810;
    --bg-surface: #0a1122;
    --bg-card: rgba(13, 21, 39, 0.7);
    --border-subtle: rgba(30, 48, 80, 0.5);
    --text-main: #f8fafc;
    --text-sub: #94a3b8;
    --electric-cyan: #00f0ff;
    --cool-blue: #0A84FF;
    --muted-teal: #14b8a6;
    
    background-color: var(--bg-primary);
    color: var(--text-main);
    font-family: 'Inter', -apple-system, sans-serif;
  }
}

body {
  background: 
    radial-gradient(circle at 15% 50%, rgba(0, 240, 255, 0.05), transparent 40%),
    radial-gradient(circle at 85% 30%, rgba(10, 132, 255, 0.05), transparent 40%),
    #040810;
  min-height: 100vh;
  overflow-x: hidden;
}

body::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: -1;
}

.premium-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  transition: all 0.3s ease;
}

.premium-card:hover {
  border-color: rgba(0, 240, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 240, 255, 0.1);
  transform: translateY(-2px);
}

.status-green { color: #10b981; }
.status-amber { color: #f59e0b; }
.status-red { color: #f43f5e; }
.status-cyan { color: var(--electric-cyan); }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #334155; }
`;
fs.writeFileSync('src/index.css', indexCss);
console.log('Updated index.css');
