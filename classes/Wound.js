class Wound {
    constructor(args) {
        this.collagen = [];
        this.width = args.width;
        this.collagenRatio = args.collagenRatio;
        this.maxGrowth = args.maxGrowth;
        this.activated = false;
    }

    display() {
        for (let coll of this.collagen) {
            coll.update();
            coll.display();
        }
        this.update();
    }

    update() {
        
    }
}