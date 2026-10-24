class EndothelialCell {
    constructor(x, y, w, h, angle) {
        this.pos = createVector(x, y);
        this.w = w;
        this.h = h;
        this.angle = angle;
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);

        rectMode(CENTER);
        fill("#65A9E8");
        stroke("#3678B5");
        strokeWeight(1);
        rect(0, 0, this.w, this.h, this.h / 2);

        pop();
    }
}
