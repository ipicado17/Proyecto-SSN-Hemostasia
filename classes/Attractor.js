class Attractor {
    constructor(x, y, g, mass) {
        this.pos = createVector(x, y);
        this.mass = mass;
        this.g = g;
        this.minDist = 0.1;
    }
    attract(agent) {
        let r = p5.Vector.sub(this.pos, agent.pos);
        const mag = max(r.magSq(), this.minDist**2);
        const c = this.g * this.mass * agent.mass / mag;
        r.normalize();
        r.mult(c);
        agent.addForce(r);
    }
    display() {
        noStroke();
        if (this.g > 0)
            fill(0, 255, 0);
        else
            fill(255, 0, 0);
        ellipse(this.pos.x, this.pos.y, 5);
    }
}