import p5 from 'p5';

export const sketch = (p: p5) => {
  // Canvas setup
  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.background(20);
  };

  // Drawing loop
  p.draw = () => {
    p.fill(255, 50);
    p.noStroke();
    p.ellipse(p.mouseX, p.mouseY, 20, 20);
  };

  // Window resize handler
  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    p.background(20);
  };
};
