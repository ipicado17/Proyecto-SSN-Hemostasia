class Wound {
    constructor(args) {
        this.collagen = [];
        this.width = args.width;
        this.collagenRatio = args.collagenRatio;
        this.maxGrowth = args.maxGrowth;
        this.activated = false;
        this.start;
        this.end;
        this.entranceY;
    }

    generateCollagen(vesselBoundary) {
        this.collagen = [];

        for (let x = this.start; x <= this.end; x += 6) {
            let index = constrain(
                Math.round(x),
                0,
                vesselBoundary.length - 1
            );

            let y = vesselBoundary[index];

            this.collagen.push(
                new Collagen(x, y)
            );
        }
    }

    display() {
        for (let coll of this.collagen) {
            coll.display();
        }
    }

    update() {

    }
}