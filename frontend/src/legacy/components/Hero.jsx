import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'motion/react';
import Flag from '@/legacy/components/Flag';

function Hero() {
  // Coordinates for the spotlight effect (Absolute pixels)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Coordinates for the 3D card tilt (Relative -0.5 to 0.5)
  const mouseXRel = useMotionValue(0);
  const mouseYRel = useMotionValue(0);

  // Smooth springs specifically for the text card parallax
  const rotateX = useSpring(useTransform(mouseYRel, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseXRel, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    
    // Set spotlight center
    mouseX.set(x);
    mouseY.set(y);
    
    // Set tilt variables
    mouseXRel.set((x / width) - 0.5);
    mouseYRel.set((y / height) - 0.5);
  }

  function handleMouseLeave() {
    // Reset the card to a flat position when mouse leaves
    mouseXRel.set(0);
    mouseYRel.set(0);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative h-[500px] w-full rounded-2xl overflow-hidden bg-[#050505] flex flex-col justify-end p-8 md:p-12 border border-white/5 shadow-2xl"
      style={{ perspective: 1200 }}
    >
      {/* 
        Z-0 Base Layer: Your original Flag component. 
        Slightly dimmed so the spotlight effect pops.
      */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Flag />
      </div>

      {/* 
        Z-10 Spotlight Layer: The Creative Hover Effect
        Reveals a clean digital checkered pattern precisely where the user's cursor is.
      */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          // Data URI used to prevent DOM clutter and rendering bugs
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20zM20 0h20v20H20V0z' fill='%23ffffff' fill-opacity='0.07' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          maskImage: useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black, transparent 80%)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black, transparent 80%)`,
        }}
      />
      
      {/* 
        Z-10 Light Beam: A soft glow that follows the cursor 
        to gently illuminate your Flag underneath
      */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.4), transparent 80%)`,
        }}
      />

      {/* Bottom gradient so text is always 100% readable regardless of flag colors */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

      {/* 
        Z-20 Foreground Content: 
        Strictly separated from the background to guarantee no overlapping.
        The 3D wobble is isolated purely to this card.
      */}
      <div className="z-20 relative w-full h-full flex items-end">
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="w-full max-w-xl bg-black/60 backdrop-blur-md rounded-2xl p-8 md:px-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
        >
          {/* Red F1-style Accent Line */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-600 to-transparent rounded-t-2xl opacity-80" />
          
          <h1 
            className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg"
            style={{ transform: "translateZ(30px)" }} // Pops the text out from the glass card
          >
            Sector <span className="text-red-600">Seven</span>
          </h1>
          
          <p 
            className="text-zinc-400 mt-2 text-lg md:text-xl font-medium"
            style={{ transform: "translateZ(20px)" }}
          >
            Your home for every session, every race.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Hero;