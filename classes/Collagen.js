class Collagen {
    constructor(x, y) {
        this.pos = createVector(x, y);
    }

    display() {
        push();

        stroke("#F2D16B");
        strokeWeight(4);

        line(
            this.pos.x - 4,
            this.pos.y + 3,
            this.pos.x,
            this.pos.y - 3
        );

        line(
            this.pos.x,
            this.pos.y - 3,
            this.pos.x + 4,
            this.pos.y + 3
        );

        pop();
    }
}