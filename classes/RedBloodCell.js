class RedBloodCell extends Cell {
    constructor(x, y, mass, topVessel, botVessel) {
        super(x, y, mass, topVessel, botVessel);
        this.c = color("#D62828");
        this.maxSpeed = 3;
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

    borders() {
        // Las paredes verticales siguen la forma del vaso en cada x.
        let index = Math.round(constrain(this.pos.x, 0, this.topVessel.length - 1));
        let endothelialGap = 11;
        let minY = this.topVessel[index] + this.r + endothelialGap;
        let maxY = this.botVessel[index] - this.r - endothelialGap;

        if (this.pos.y < minY)
            this.vel.y *= -this.borderDamp;
        if (this.pos.y > maxY)
            this.vel.y *= -this.borderDamp;
        this.pos.y = constrain(this.pos.y, minY, maxY);
    }

    static createRandomCell(mass, topVessel, botVessel) {
        const x = -10;
        const y = random(topVessel[0] + 20, botVessel[0] - 20);
        const cell = new RedBloodCell(x, y, mass, topVessel, botVessel);

        const force = p5.Vector.fromAngle(cell.ang);
        force.setMag(200);
        cell.addForce(force);

        return cell;
    }
}