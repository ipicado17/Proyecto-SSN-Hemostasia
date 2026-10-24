class BloodVessel {
    constructor(topBoundary, bottomBoundary) {
        this.topBoundary = topBoundary;
        this.bottomBoundary = bottomBoundary;
        this.width = topBoundary.length - 1;

        //se reutiliza SkinLayer para dibujar el vaso
        this.body = new SkinLayer(
            "vaso",
            "#842C15",
            topBoundary,
            bottomBoundary
        );
    }

    display() {
        this.body.display();

        // Revestimiento endotelial provisional
        push();
        noFill();
        stroke("#65A9E8");
        strokeWeight(8);

        for (const boundary of [
            this.topBoundary,
            this.bottomBoundary
        ]) {
            beginShape();

            for (let x = 0; x < this.width; x += 5) {
                vertex(x, boundary[x]);
            }

            vertex(this.width, boundary[this.width]);
            endShape();
        }

        pop();
    }
}
