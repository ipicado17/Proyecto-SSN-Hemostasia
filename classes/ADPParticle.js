
class ADPParticle {
    constructor(x, y, radius) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D();
        this.mass = random(3, 6);
        this.massLoss = 0.20;
        this.r = sqrt(this.mass / PI) * 2;
    }

    update() {
        this.pos.add(this.vel);
        this.mass = max(0, this.mass - this.massLoss);
        this.r = sqrt(this.mass / PI) * 2;
    }

    display() {
        noStroke();
        fill(90, 105, 230, 300);
        ellipse(this.pos.x, this.pos.y, this.r * 2);
    }

    isDead() {
        return this.mass <= 0;
    }
}
