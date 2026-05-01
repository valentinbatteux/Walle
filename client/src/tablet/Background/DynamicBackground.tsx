/* Deep-space nebula — CSS animations only, zero JS cost */
export function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-10" style={{ background: '#010828' }}>
      <div style={{
        position: 'absolute', width: '85vw', height: '85vw',
        top: '-25%', left: '-18%',
        background: 'radial-gradient(circle, rgba(111,255,0,0.04) 0%, rgba(60,20,140,0.15) 40%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'nebula-a 32s ease-in-out infinite',
        willChange: 'transform',
      }} />
      <div style={{
        position: 'absolute', width: '70vw', height: '70vw',
        bottom: '-15%', right: '-12%',
        background: 'radial-gradient(circle, rgba(20,55,180,0.12) 0%, transparent 68%)',
        filter: 'blur(100px)',
        animation: 'nebula-b 26s ease-in-out infinite',
        willChange: 'transform',
      }} />
    </div>
  );
}
