class Platelet extends Cell {
    constructor(x, y, mass, topVessel, botVessel, transformedCells = []) {
        super(x, y, mass, topVessel, botVessel);
        this.radiusScale = 0.8;
        this.r = sqrt(this.mass / PI) * this.radiusScale;
        this.collisionRadius = this.r * 1.25;
        this.c = color("#FFFFFF");
        this.maxSpeed = 2;
        this.state = 0;
        this.activationFrame = null;
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

        if (this.state === 2) {
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
        const offset = p5.Vector.sub(a1.pos, a2.pos);
        const distance = offset.mag();

        if (distance === 0) {
            offset.set(1, 0);
        } else {
            offset.div(distance);
        }

        const radius1 = a1.collisionRadius || a1.r;
        const radius2 = a2.collisionRadius || a2.r;
        const overlap = radius1 + radius2 - distance;
        if (overlap <= 0) {
            return;
        }

        offset.mult(overlap * 0.5);
        a1.pos.add(offset);
        a2.pos.sub(offset);

        const incoming = a1.vel.dot(offset);
        if (incoming < 0) {
            a1.vel.sub(p5.Vector.mult(offset, incoming / offset.magSq()));
        }
    }

    borders() {

        if (this.state !== 0) {
            const thisIndex = this.transformedCells.indexOf(this);
            for (let i = 0; i < thisIndex; i++) {
                const c = this.transformedCells[i];
                if (c.touch(this)) {
                    this.separate(this, c);
                }
            }

            if (this.isInsideWoundChannel()) {
                this.pos.y = constrain(
                    this.pos.y,
                    this.wound.entranceY - 20,
                    this.wound.entranceY - this.r
                );
            }
        }
        this.woundBorders();
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