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
        this.attractor = null;
        this.wound = new Wound(woundArgs);
        this.state = 0; //Antes de la herida
        this.wait = 0;
        this.transformedCells = [];
        this.generate();
        this.change = false;
        this.woundReady = false;
        this.fibrin = null;

        // Variables para sliders
        this.plateletsToClose = 25; // Variable cambiable por slide
        this.plateletAdhesion = 1.0;
        this.plateletAttraction = 1.0;
        this.fibrinSpringsStep = 3;
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
        if (this.fibrin !== null) {
            this.fibrin.display();
        }
    }

    addRedBloodCell(mass) {
        let redBloodCell = RedBloodCell.createRandomCell(
            mass,
            this.vessel.topBoundary,
            this.vessel.bottomBoundary
        );

        redBloodCell.setWound(this.wound);

        this.cells.push(redBloodCell);
    }

    addPlatelet(mass) {
        let platelet = Platelet.createRandomCell(
            mass,
            this.vessel.topBoundary,
            this.vessel.bottomBoundary,
            this.transformedCells
        );

        platelet.setWound(this.wound);

        this.cells.push(platelet);
    }

    transformPlacelet(c) {
        if (c instanceof Platelet && c.isUnderWound()) {
            if (c.state === 0) {
                // No activar nuevas plaquetas después del cierre
                if (!this.wound.closed) {
                    let nearCollagen = this.wound.collagen.some(collagen =>
                        dist(c.pos.x, c.pos.y, collagen.pos.x, collagen.pos.y) <= c.r + 20
                    );
                    if (nearCollagen && !c.adhesionAttempted) {
                        c.adhesionAttempted = true;
                        if (random() < this.plateletAdhesion) {
                            this.transformedCells.push(c);
                            c.state = 1;
                            c.maxSpeed /= 1.02;
                            c.activationFrame = frameCount + frameRate() * 5;
                        }
                    }
                }
            } else if (c.state === 1) {
                // Permitir completar la adhesión aunque la herida esté cerrada
                let nearCollagen = this.wound.collagen.some(collagen =>
                    dist(c.pos.x, c.pos.y, collagen.pos.x, collagen.pos.y) <= c.r + 10
                );

                if (frameCount >= c.activationFrame && nearCollagen) {
                    c.state = 2;
                    c.vel.mult(0);
                }
            }

            // Las plaquetas en estado 1 continúan moviéndose hacia el colágeno
            if (c.state === 1 && this.wound.collagen.length > 0) {
                const target = this.wound.collagen.reduce(
                    (best, collagen) => {
                        const occupied = this.transformedCells.filter(platelet =>
                            dist(
                                platelet.pos.x,
                                platelet.pos.y,
                                collagen.pos.x,
                                collagen.pos.y
                            ) < 100
                        ).length;

                        return occupied < best.occupied
                            ? { collagen, occupied }
                            : best;
                    },
                    { collagen: this.wound.collagen[0], occupied: Infinity }
                );

                const slide = p5.Vector.sub(target.collagen.pos, c.pos);
                slide.mult(0.05);
                c.addForce(slide);
            }
        }
    }

    isWoundReady() {
        let adhered = this.transformedCells.filter(c => c.state === 2);
        return adhered.length >= this.plateletsToClose;
    }

    closeWoundIfReady() {
        if (this.isWoundReady()) {
            this.wound.closed = true;
            this.attractor = null;
            this.reorganizedCells();
        }
    }

    reorganizedCells() {
        for (let i = 0; i < this.transformedCells.length; i++) {
            let c1 = this.transformedCells[i];
            for (let j = i + 1; j < this.transformedCells.length; j++) {
                let c2 = this.transformedCells[j];
                if (c1.state === 2 && c2.state === 2 && c1.touch(c2))
                    c1.separate(c1, c2);
            }
        }
    }

    finishWound() {
        if (!this.wound.closed || this.woundReady) {
            return;
        }

        for (const c of this.transformedCells) {
            if (c.state === 1) {
                c.state = 2;
                c.vel.mult(0);
            }
        }

        this.woundReady = true;
    }

    readyToApplyFribrin() {
        return this.transformedCells.filter(c => c.state === 2).length === this.transformedCells.length;
    }

    update() {
        for (let c of this.cells) {

            if (!c.isDead() && !c.isOutsideVessel()) {
                this.transformPlacelet(c);

                if (c.state !== 2) {
                    let force = this.vessel.getVector(c.pos.x, c.pos.y);
                    c.addForce(c.state === 0 ? force : force.div(10));
                }
                c.applyDrag(this.dragCoefficient);
                if (!this.wound.closed && this.attractor !== null && c.state !== 2) {
                    let intensity = c instanceof Platelet ? this.plateletAttraction : 1;
                    this.attractor.attract(c, intensity);
                }
            }
            c.update();
            if (c.isDead()) {
                this.cells.splice(this.cells.indexOf(c), 1);
            }
        }

        this.vessel.updateFlowField();

        if (!this.wound.closed)
            this.closeWoundIfReady();
        if (this.wound.closed)
            this.finishWound();

        if (
            this.wound.closed &&
            !this.fibrin &&
            this.transformedCells.length > 0 &&
            this.readyToApplyFribrin()
        ) {
            this.fibrin = new Fibrin(this.transformedCells);
        }

        if (this.fibrin) {
            this.fibrin.springsPerStep = this.fibrinSpringsStep
            this.fibrin.update();
        }

        if (this.change && frameCount >= this.wait) {
            console.log(this.state);
            this.change = false;
            this.state++;
        }
    }
}
