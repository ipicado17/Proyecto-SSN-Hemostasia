class RedBloodCell extends Cell {
    constructor(x, y, mass, topVessel, botVessel) {
        super(x, y, mass, topVessel, botVessel);
        this.c = color("#D62828");
        this.maxSpeed = 2.5;
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.ang);

        noStroke();
        fill(this.c);
        ellipse(0, 0, this.r * 2.8);

        fill("#9E1B1B");
        ellipse(0, 0, this.r * 1.25);

        pop();
    }

    static createRandomCell(mass, topVessel, botVessel) {
        const x = 5;
        const y = random(topVessel[0] + 20, botVessel[0] - 20);
        const cell = new RedBloodCell(x, y, mass, topVessel, botVessel);

        const force = p5.Vector.fromAngle(cell.ang);
        force.setMag(100);
        cell.addForce(force);

        return cell;
    }
}