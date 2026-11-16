class FibrinPoint {
    constructor(x, y, fixed, restX, restY) {
        this.pos = createVector(x, y);
        this.restPos = createVector(restX, restY);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.mass = 1;
        this.fixed = fixed;
    }

    addForce(force) {
        this.acc.add(p5.Vector.div(force, this.mass));
    }

    update() {
        if (this.fixed) {
            this.vel.mult(0);
            this.acc.mult(0);
            return;
        }

        this.vel.add(this.acc);
        this.vel.mult(0.9);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }
}
