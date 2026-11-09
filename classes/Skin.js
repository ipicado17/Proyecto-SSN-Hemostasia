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
    }

    createWound(x) {
        if (this.hasWound) {
            return;
        }
        this.hasWound = true;

        let width = this.wound.width;
        let start = x - width;
        let end = x + width;
        this.wound.start = start;
        this.wound.end = end;
        let originalVesselBoundary = [...this.vessel.topBoundary];
        this.wound.entranceY = originalVesselBoundary[Math.round(x)];

        for (let i = -width; i < width; i++) {
            this.epidermis.topBoundary[i + x] = 100;
            this.dermis.topBoundary[i + x] = 100;
            this.vessel.topBoundary[i + x] = 100;
        }

        this.vessel.removeCells(start, end);
        this.wound.generateCollagen(originalVesselBoundary);

        for (let cell of this.cells) {
            cell.setWound(this.wound);
        }

        this.attractor = new Attractor(
        x,
        -10,
        10,
        3000
        );
        this.state = 1; //Herida
        this.wait = frameCount + frameRate()*0;
    }

    getBleedingForce(cell) {
        if (!this.hasWound) {
            return createVector(0, 0);
        }

        

        /* let woundX = (this.wound.start + this.wound.end) / 2;
        // Distancia de la celula a la entrada de la herida
        let distanceToWound = dist(cell.pos.x, cell.pos.y, woundX, this.wound.entranceY);
        let bleedingRange = 250;
        if (distanceToWound > bleedingRange) {
             return createVector(0, 0);
        }
         // Entre más lejos esté de la herida, menor fuerza recibe
        let strength = map(distanceToWound, 0, bleedingRange, 40, 5);
         // Si está dentro del vaso,
         // se le aplica fuerza hacia la abertura
        if (cell.pos.y >= this.wound.entranceY) {
             let direction = createVector(woundX - cell.pos.x, -100);
             direction.setMag(strength);
            return direction;
        }
         // Si ya está dentro de la herida
         // se impulsa hacia arriba
        return createVector(0, -strength); */
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
                this.state === 2 &&
                c instanceof Platelet &&
                c.isUnderWound() &&
                this.wound.collagen.some(
                    collagen =>
                        dist(c.pos.x, c.pos.y, collagen.pos.x, collagen.pos.y) <= c.r + 20
                )
            ) {
                c.transformed = true;
            }
        this.transformedCells.push(c);
    }

    update() {
        if (this.state == 1) {
            if (frameCount >= this.wait) {
                this.state = 2; //Tapon plaquetario temporal
            }
        }
        for (let c of this.cells) {
            this.transformPlacelet(c);
            if (!c.isDead() && !c.isOutsideVessel()) {
                let force = this.vessel.getVector(c.pos.x, c.pos.y);
                c.addForce(force);
                //fuerza del sangrado
                //let bleedingForce = this.getBleedingForce(c);
                //c.addForce(bleedingForce);
                c.applyDrag(this.dragCoefficient);
                if (this.attractor !== null) this.attractor.attract(c);
            }
            c.update();
            if (c.isDead()) {
                this.cells.splice(this.cells.indexOf(c), 1);
            }
        }
        this.vessel.updateFlowField();
    }
}
