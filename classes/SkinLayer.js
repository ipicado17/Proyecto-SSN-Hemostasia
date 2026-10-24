class SkinLayer {
    constructor(name, fillColor, topBoundary, bottomBoundary) {
        this.name = name;
        this.fillColor = fillColor;
        this.topBoundary = topBoundary;
        this.bottomBoundary = bottomBoundary;
        this.width = topBoundary.length - 1;
    }

    display() {
        push();
        noStroke();
        fill(this.fillColor);

        beginShape();

        //borde superior de izquierda a derecha
        for (let x = 0; x < this.width; x += 5) {
            vertex(x, this.topBoundary[x]);
        }
        vertex(this.width, this.topBoundary[this.width]);

        //borde inferior de derecha a izquierda
        for (let x = this.width; x > 0; x -= 5) {
            vertex(x, this.bottomBoundary[x]);
        }
        vertex(0, this.bottomBoundary[0]);

        endShape(CLOSE);

        pop();
    }
}
