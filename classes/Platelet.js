class Platelet extends Cell {
    constructor(x, y, mass, topVessel, botVessel, transformedCells = []) {
        super(x, y, mass, topVessel, botVessel);
        this.c = color("#FFFFFF");
        this.maxSpeed = 2;
        this.transformed = false;
        this.transformedCells = transformedCells;
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.ang);

        stroke("#B8B8B8");
        strokeWeight(1);
        fill(this.c);

        const radius = this.r;
        const spikeRadius = radius * 1.8;
        const points = 12;

        if (this.transformed) {
            beginShape();
            for (let i = 0; i < points; i++) {
                const angle = TWO_PI * i / points;
                const length = i % 2 === 0 ? radius : spikeRadius;
                vertex(cos(angle) * length, sin(angle) * length);
            }
            endShape(CLOSE);
        }

        ellipse(0, 0, radius * 2.5);

        pop();
    }

    separate(a1, a2) {
        let d1 = p5.Vector.sub(a1.pos, a2.pos);

        d1.normalize();
        d1.setMag(a1.r + a2.r);
        d1.add(a2.pos);
        a1.pos = d1;
    }

    borders() {
        
        this.woundBorders();
        if (this.transformed) {
            for (let c of this.transformedCells) {
                if (c.touch(this)) {
                        this.separate(this, c);
                    }
            }

            if (this.pos.y <= this.r) {   
                this.vel.y *= -this.borderDamp;
                this.pos.y = this.r;
            }    
        }
        // Las paredes verticales siguen la forma del vaso en cada x.
        let index = Math.round(constrain(this.pos.x, 0, this.topVessel.length - 1));
        let endothelialGap = 16;
        let minY = this.topVessel[index] + this.r + endothelialGap;
        let maxY = this.botVessel[index] - this.r - endothelialGap;

        // La pared superior no existe dentro de la herida
        if (!this.isUnderWound()) {
            if (this.pos.y < minY) {
                this.vel.y *= -this.borderDamp;
            }

            this.pos.y = max(this.pos.y, minY);
        }

        // La pared inferior sigue existiendo
        if (this.pos.y > maxY) {
            this.vel.y *= -this.borderDamp;
            this.pos.y = maxY;
        }
    }

    static createRandomCell(mass, topVessel, botVessel, transformedCells = []) {
        const x = -10;
        const y = random(topVessel[0] + 15, botVessel[0] - 15);
        const cell = new Platelet(x, y, mass, topVessel, botVessel, transformedCells);

        const force = p5.Vector.fromAngle(cell.ang);
        force.setMag(200);
        cell.addForce(force);

        return cell;
    }
}