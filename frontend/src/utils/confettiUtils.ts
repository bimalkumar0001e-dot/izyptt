/**
 * Utility functions for confetti animations in the application
 */

// Simple confetti effect using canvas
export const showConfetti = () => {
  try {
    // Create canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas properties
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    
    // Confetti particles
    const particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      speed: number;
      angle: number;
      rotation: number;
      rotationSpeed: number;
    }[] = [];
    
    // Create particles
    const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF'];
    const particleCount = Math.min(Math.max(canvas.width, canvas.height) / 3, 200); // Limit for performance
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 15 + 5,
        angle: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: Math.random() * 0.2 - 0.1
      });
    }
    
    // Animation
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let completed = true;
      
      particles.forEach(particle => {
        // Update position
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed + 1; // Add gravity
        particle.rotation += particle.rotationSpeed;
        particle.speed *= 0.96; // Slow down
        
        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore();
        
        // Check if any particles are still visible
        if (
          particle.y < canvas.height + 100 && 
          particle.x > -100 && 
          particle.x < canvas.width + 100
        ) {
          completed = false;
        }
      });
      
      // Continue animation or clean up
      if (!completed) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    // Clean up if page changes
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    };
  } catch (error) {
    console.error('Error showing confetti:', error);
  }
};

// Alternative simpler confetti implementation that works on more browsers
export const showSimpleConfetti = () => {
  try {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    
    const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF'];
    const particleCount = 150;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      
      // Random properties
      const size = Math.random() * 10 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 0.5;
      
      // Apply styles
      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.left = `${left}%`;
      particle.style.top = '-20px';
      particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      particle.style.opacity = '1';
      
      // Animation
      particle.style.animation = `confetti-fall ${duration}s ease-in ${delay}s forwards`;
      
      // Add to container
      container.appendChild(particle);
    }
    
    // Add keyframe animation to document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleSheet);
    
    // Clean up after animation completes
    setTimeout(() => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    }, 5000);
    
    return () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  } catch (error) {
    console.error('Error showing simple confetti:', error);
  }
};
