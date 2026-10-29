class Platelet extends Cell {
    constructor(x, y, mass, topVessel, botVessel) {
        super(x, y, mass, topVessel, botVessel);
        this.c = color("#FFFFFF");
        this.maxSpeed = 2;
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.ang);

        stroke("#B8B8B8");
        strokeWeight(1);
        fill(this.c);

        const radius = this.r * 1.5;
        const spikeRadius = radius * 1.8;
        const points = 12;

        beginShape();
        for (let i = 0; i < points; i++) {
            const angle = TWO_PI * i / points;
            const length = i % 2 === 0 ? radius : spikeRadius;
            vertex(cos(angle) * length, sin(angle) * length);
        }
        endShape(CLOSE);

        ellipse(0, 0, radius * 2.5);

        pop();
    }

    borders() {
        // Las paredes verticales siguen la forma del vaso en cada x.
        let index = Math.round(constrain(this.pos.x, 0, this.topVessel.length - 1));
        let endothelialGap = 16;
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
        const y = random(topVessel[0] + 15, botVessel[0] - 15);
        const cell = new Platelet(x, y, mass, topVessel, botVessel);

        const force = p5.Vector.fromAngle(cell.ang);
        force.setMag(200);
        cell.addForce(force);

        return cell;
    }
}