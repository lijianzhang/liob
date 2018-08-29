(global as any).requestAnimationFrame = callback => setTimeout(callback, 0);
