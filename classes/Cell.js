class Cell {
    constructor(x, y, mass, topVessel, botVessel) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.mass = mass < 0 ? 0 : mass;
        this.ang = random(-PI / 3, PI / 3);
        this.radiusScale = 1;
        this.r = sqrt(this.mass / PI) * this.radiusScale;
        this.c = color("#E53945");
        this.massLoss = 1;
        this.borderDamp = 0.8;
        this.maxSpeed = 2;

        /* Atributos para establecer los límites de las células
         * con base al vaso sanguíneo
         */
        this.topVessel = topVessel;
        this.botVessel = botVessel;

        this.wound;
    }

    static createRandomCell(mass, topVessel, botVessel) { }

    display() { }

    borders() { }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.borders();

        // Solo pierde masa cuando su centro atraviesa un extremo horizontal.
        if (this.isOutsideVessel()) {
            this.mass = Math.max(0, this.mass - this.massLoss);
            this.r = sqrt(this.mass / PI) * this.radiusScale;
        }

    }

    touch(a) {
        let d = dist(this.pos.x,this.pos.y, a.pos.x,a.pos.y);
        
        if (d <= a.r+this.r) {
            return true;
        }
        return false;
    }

    addForce(f) {
        let force = p5.Vector.div(f, this.mass);
        this.acc.add(force);
    }

    applyDrag(d) {
        let drag = this.vel.copy();
        drag.normalize();
        drag.mult(this.vel.mag() ** 2);
        drag.mult(-d);
        this.addForce(drag);
    }

    isDead() {
        return this.mass <= 0;
    }

    isOutsideVessel() {
        let maxX = Math.min(this.topVessel.length, this.botVessel.length) - 1;
        let escapedThroughWound = this.wound.start !== null && this.pos.y < -this.r;
        return (this.pos.x < 0 || this.pos.x > maxX || escapedThroughWound);
    }

    setWound(wound) {
        this.wound = wound;
    }

    isUnderWound() {
        return (
            this.wound.start !== null &&
            this.pos.x >= this.wound.start &&
            this.pos.x <= this.wound.end
        );
    }

    isInsideWoundChannel() {
        return (
            this.wound.entranceY !== null &&
            this.pos.y < this.wound.entranceY
        );
    }

    woundBorders() {
        if (!this.isInsideWoundChannel()) {
            return;
        }

        // Pared izquierda de la herida
        if (this.pos.x - this.r < this.wound.start) {
            this.pos.x = this.wound.start + this.r;
            this.vel.x = abs(this.vel.x) * this.borderDamp;
        }

        // Pared derecha de la herida
        if (this.pos.x + this.r > this.wound.end) {
            this.pos.x = this.wound.end - this.r;
            this.vel.x = -abs(this.vel.x) * this.borderDamp;
        }
    }
}