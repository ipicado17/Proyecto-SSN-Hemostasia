class FibrinSpring {
    constructor(agent1, agent2, k, restLen) {
        this.agent1 = agent1;
        this.agent2 = agent2;
        this.k = k;
        this.restLen = restLen;
        this.c = color("#f4d58d");
    }

    update() {
        let springForce = p5.Vector.sub(this.agent1.pos, this.agent2.pos);
        let len = springForce.mag();
        springForce.normalize();
        let displacement = len - this.restLen;
        springForce.mult(-this.k * displacement);
        springForce.div(2);
        this.agent1.addForce(springForce);
        springForce.mult(-1);
        this.agent2.addForce(springForce);
    }

    display() {
        stroke(this.c);
        line(
            this.agent1.pos.x,
            this.agent1.pos.y,
            this.agent2.pos.x,
            this.agent2.pos.y
        );
    }
}
