class Cell {
    constructor(x, y, mass, topVessel, botVessel){
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.mass = mass < 0? 0: mass;
        this.ang = random(-PI / 3, PI / 3);
        this.r = sqrt(this.mass / PI);
        this.c = color("#E53945");
        this.massLoss = 0.8;
        this.borderDamp = 0.8;
        this.maxSpeed = 2; 

        /* Atributos para establecer los límites de las células
         * con base al vaso sanguíneo
         */
        this.topVessel = topVessel;
        this.botVessel = botVessel;       
    }

    static createRandomCell(mass, topVessel, botVessel) {
        let x = 5;
        let y = random(topVessel[0] + 10, botVessel[0] - 10);

        let cell = new Cell(x, y, mass, topVessel, botVessel);

        let force = p5.Vector.fromAngle(cell.ang);
        force.setMag(100);
        cell.addForce(force);

        return cell;
    }

    update(){
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.borders();

        // Solo pierde masa cuando su centro atraviesa un extremo horizontal.
        if (this.isOutsideVessel()) {
            this.mass = Math.max(0, this.mass - this.massLoss);
            this.r = sqrt(this.mass / PI);
        }

    }

    display(){
        noStroke();
        fill(this.c);
        ellipse(this.pos.x, this.pos.y, this.r * 2);
    }

    borders() {
        // Las paredes verticales siguen la forma del vaso en cada x.
        let index = Math.round(constrain(this.pos.x, 0, this.topVessel.length - 1));
        let endothelialGap = 10;
        let minY = this.topVessel[index] + this.r + endothelialGap;
        let maxY = this.botVessel[index] - this.r - endothelialGap;

        if (this.pos.y < minY)
            this.vel.y *= -this.borderDamp;
        if (this.pos.y > maxY)
            this.vel.y *= -this.borderDamp;
        this.pos.y = constrain(this.pos.y, minY, maxY);
    }

    addForce(f){
        let force = p5.Vector.div(f, this.mass);
        this.acc.add(force);
    }

    applyDrag(d){
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
        return this.pos.x < 0 || this.pos.x > maxX;
    }
}