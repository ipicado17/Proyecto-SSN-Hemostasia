class Skin {
    constructor(w, h, woundArgs, seed = 12345) {
        this.width = w;
        this.height = h;

        //semilla de ruido para variaciones en la piel
        this.seed = seed;

        // Control del conjunto de celulas del vaso
        this.dragCoefficient = 0.05;
        this.cells = [];

        this.hasWound = false;
        /*this.woundStart = null;
        this.woundEnd = null;
        this.woundEntranceY = null;*/
        this.attractor = null;
        this.wound = new Wound(woundArgs);
        this.state = 0; //Antes de la herida
        this.wait = 0;
        this.transformedCells = [];
        this.generate();
        this.change = false;
    }

    createWound(x) {
        if (this.hasWound) {
            return;
        }
        this.hasWound = true;

        const centerX = constrain(Math.round(x), 0, this.width);
        const halfWidth = this.wound.width;
        const start = max(0, centerX - halfWidth);
        const end = min(this.width, centerX + halfWidth);

        this.wound.start = start;
        this.wound.end = end;
        let originalVesselBoundary = [...this.vessel.topBoundary];
        this.wound.entranceY = originalVesselBoundary[centerX];

        for (let i = start; i < end; i++) {
            this.epidermis.topBoundary[i] = 100;
            this.dermis.topBoundary[i] = 100;
            this.vessel.topBoundary[i] = 100;
        }

        this.vessel.removeCells(start, end);
        this.wound.generateCollagen(originalVesselBoundary);

        for (let cell of this.cells) {
            cell.setWound(this.wound);
        }

        this.attractor = new Attractor(
            x,
            -10,
            5,
            3000
        );
        this.state = 1; //Herida
        this.change = true;
        this.wait = frameCount + frameRate() * 5;
    }

    generate() {
        noiseSeed(this.seed);

        //borde superior de la pantalla
        const surface = [];
        //linea que divide la epidermis de la dermis
        const epidermisBottom = [];
        //linea que divide la dermis del vaso
        const vesselTop = [];
        //linea que divide el vaso de la hipodermis
        const vesselBottom = [];
        //borde inferior de la pantalla
        const floor = [];

        for (let x = 0; x <= this.width; x++) {
            surface.push(0);
            floor.push(this.height);

            //EPIDERMIS
            //posición inicial + x * frecuencia del ruido
            const epidermisWave = map(noise(10 + x * 0.008), 0, 1, -1, 1);
            //altura base + ruido normalizado * amplitud
            epidermisBottom.push(this.height * 0.10 + epidermisWave * this.height * 0.012);

            //VASO:
            //posición inicial + x * frecuencia del ruido
            const vesselWave = map(noise(100 + x * 0.004), 0, 1, -1, 1);
            const upperDetail = map(noise(200 + x * 0.006), 0, 1, -1, 1);
            const lowerDetail = map(noise(300 + x * 0.005), 0, 1, -1, 1);
            //altura base + ondulación principal * amplitud + irregularidad independiente * amplitud
            vesselTop.push(this.height * 0.30 + vesselWave * this.height * 0.025 + upperDetail * this.height * 0.006);
            vesselBottom.push(this.height * 0.90 + vesselWave * this.height * 0.025 + lowerDetail * this.height * 0.008);
        }

        // Construcción de las capas
        this.epidermis = new SkinLayer(
            "epidermis",
            "#ffc4cd",
            surface,
            epidermisBottom
        );

        this.dermis = new SkinLayer(
            "dermis",
            "#ff9a9d",
            epidermisBottom,
            vesselTop
        );

        this.vessel = new BloodVessel(
            vesselTop,
            vesselBottom
        );

        this.hypodermis = new SkinLayer(
            "hipodermis",
            "#fde492",
            vesselBottom,
            floor
        );
    }

    display() {
        this.epidermis.display();
        this.dermis.display();
        this.hypodermis.display();
        this.vessel.display();
        this.wound.display();
        for (let cell of this.cells) {
            cell.display();
        }
    }

    addCell(mass) {
        let redBloodCell = RedBloodCell.createRandomCell(
            mass,
            this.vessel.topBoundary,
            this.vessel.bottomBoundary
        );

        let platelet = Platelet.createRandomCell(
            mass,
            this.vessel.topBoundary,
            this.vessel.bottomBoundary,
            this.transformedCells
        );

        redBloodCell.setWound(this.wound);
        platelet.setWound(this.wound);

        this.cells.push(redBloodCell);
        this.cells.push(platelet);
    }

    transformPlacelet(c) {

        if (
            c instanceof Platelet &&
            c.isUnderWound() &&
            (c.state !== 0 || this.wound.collagen.some(
                collagen =>
                    dist(c.pos.x, c.pos.y, collagen.pos.x, collagen.pos.y) <= c.r + 20
            ))
        ) {
            if (c.state === 0) {
                this.transformedCells.push(c);
                c.state = 1;
                c.maxSpeed /= 1.02;
                c.activationFrame = frameCount + frameRate() * 5;
            } else if (
                c.state === 1 &&
                frameCount >= c.activationFrame
            ) {
                c.state = 2;
                c.vel.mult(0);
            }

            const target = this.wound.collagen.reduce(
                (best, collagen) => {
                    const occupied = this.transformedCells.filter(
                        platelet =>
                            dist(
                                platelet.pos.x,
                                platelet.pos.y,
                                collagen.pos.x,
                                collagen.pos.y
                            ) < 30
                    ).length;

                    return occupied < best.occupied
                        ? { collagen, occupied }
                        : best;
                },
                { collagen: this.wound.collagen[0], occupied: Infinity }
            );
            if (c.state !== 2) {
                const slide = p5.Vector.sub(target.collagen.pos, c.pos);
                slide.mult(0.05);
                c.addForce(slide);
            }
        }
    }

    update() {
        console.log(this.transformedCells.length);
        for (let c of this.cells) {

            if (!c.isDead() && !c.isOutsideVessel()) {
                this.transformPlacelet(c);

                if (c.state !== 2) {
                    let force = this.vessel.getVector(c.pos.x, c.pos.y);
                    c.addForce(c.state === 0 ? force : force.div(10));
                }
                c.applyDrag(this.dragCoefficient);
                if (this.attractor !== null && c.state !== 2) {
                    this.attractor.attract(c);
                }
            }
            c.update();
            if (c.isDead()) {
                this.cells.splice(this.cells.indexOf(c), 1);
            }
        }
        this.vessel.updateFlowField();

        if (this.change && frameCount >= this.wait) {
            console.log(this.state);
            this.change = false;
            this.state++;
        }
    }
}
