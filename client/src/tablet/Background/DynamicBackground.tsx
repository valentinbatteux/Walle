/* Static deep-space nebula — pure CSS animations, no JS repaints */
export function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-10" style={{ background: '#000' }}>
      <div style={{
        position: 'absolute',
        width: '90vw', height: '90vw',
        top: '-25%', left: '-20%',
        background: 'radial-gradient(circle, rgba(70,35,130,0.18) 0%, transparent 68%)',
        filter: 'blur(80px)',
        animation: 'nebula-drift-a 32s ease-in-out infinite',
        willChange: 'transform',
      }} />
      <div style={{
        position: 'absolute',
        width: '75vw', height: '75vw',
        bottom: '-15%', right: '-15%',
        background: 'radial-gradient(circle, rgba(20,55,160,0.14) 0%, transparent 68%)',
        filter: 'blur(100px)',
        animation: 'nebula-drift-b 26s ease-in-out infinite',
        willChange: 'transform',
      }} />
    </div>
  );
}
