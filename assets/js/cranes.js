const canvas = document.getElementById('craneCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let cranes = [];
const mouse = { x: null, y: null };

const CRANE_COUNT = 35;       
const MOUSE_RADIUS = 350;     
const FORCE_STRENGTH = 0.12;  
const SPEED = 0.8;
const LIFESPAN = 25000;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('mousedown', (e) => {
  for (let i = 0; i < 3; i++) {
    cranes.push(new Crane(e.x, e.y));
  }
});

class Crane {
  constructor(startX, startY) {
    this.x = startX || Math.random() * width;
    this.y = startY || Math.random() * height;
    this.vx = (Math.random() - 0.5) * SPEED;
    this.vy = (Math.random() - 0.5) * SPEED;
    this.size = Math.random() * 3 + 6; 

    this.lifeSpan = 30000 + (Math.random() * 15000)
    this.createdAt = Date.now();
  }

  update() {
    if (Date.now() - this.createdAt > LIFESPAN) {
        return -1; 
    }

    this.x += this.vx;
    this.y += this.vy;

    let distToMouse = 9999;

    if (mouse.x != null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      distToMouse = Math.sqrt(dx*dx + dy*dy);
      
      if (distToMouse < MOUSE_RADIUS) {
        const forceDirectionX = dx / distToMouse;
        const forceDirectionY = dy / distToMouse;
        const force = (MOUSE_RADIUS - distToMouse) / MOUSE_RADIUS;
        
        this.vx += forceDirectionX * force * FORCE_STRENGTH;
        this.vy += forceDirectionY * force * FORCE_STRENGTH;
      }
    }

    const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
    const maxSpeed = 3.5; 
    if (speed > maxSpeed) {
      this.vx = (this.vx / speed) * maxSpeed;
      this.vy = (this.vy / speed) * maxSpeed;
    }

    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;
    if (this.y > height) this.y = 0;
    if (this.y < 0) this.y = height;

    return distToMouse;
  }

  draw(distToMouse) {
    const angle = Math.atan2(this.vy, this.vx);
    
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle + Math.PI/2);

    const isNear = distToMouse < MOUSE_RADIUS;
    
    const wingColor = isNear ? `rgba(255, 255, 255, 0.95)` : 'rgba(255, 255, 255, 0.3)';
    const bodyColor = isNear ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
    
    ctx.beginPath();
    ctx.moveTo(0, 0); 
    ctx.lineTo(-this.size * 1.2, this.size * 0.5); 
    ctx.lineTo(0, this.size * 2); 
    ctx.closePath();
    ctx.fillStyle = wingColor; 
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0); 
    ctx.lineTo(this.size * 1.2, this.size * 0.5); 
    ctx.lineTo(0, this.size * 2); 
    ctx.closePath();
    ctx.fillStyle = wingColor;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -this.size * 1.5); 
    ctx.lineTo(this.size * 0.3, 0); 
    ctx.lineTo(0, this.size * 1.8); 
    ctx.lineTo(-this.size * 0.3, 0);
    ctx.closePath();
    ctx.fillStyle = bodyColor;
    ctx.fill();
    
    if (isNear) {
        const intensity = 1 - (distToMouse / MOUSE_RADIUS);
        ctx.shadowBlur = 20 * intensity;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    } else {
        ctx.shadowBlur = 0;
    }
    
    ctx.restore();
  }
}

function init() {
  cranes = [];
  for (let i = 0; i < CRANE_COUNT; i++) {
    cranes.push(new Crane());
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  
  cranes = cranes.filter(crane => {
      const status = crane.update();
      if (status === -1) return false;
      crane.draw(status);
      return true;
  });
  
  requestAnimationFrame(animate);
}

init();
animate();