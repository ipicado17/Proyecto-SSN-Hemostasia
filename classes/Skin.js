class Skin {
    constructor(w, h, seed = 12345) {
        this.width = w;
        this.height = h;

        //semilla de ruido para variaciones en la piel
        this.seed = seed;

        // Control del conjunto de celulas del vaso
        this.dragCoefficient = 0.05;
        this.cells = [];

        this.generate();
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
            const vesselWave = map(noise(100 + x * 0.004),0, 1, -1, 1);
            const upperDetail = map(noise(200 + x * 0.006),0, 1, -1, 1);
            const lowerDetail = map(noise(300 + x * 0.005),0, 1, -1, 1);
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
        for (let cell of this.cells) {
            cell.display();
        }
    }

    addCell(mass) {
        this.cells.push(Cell.createRandomCell(
            mass, this.vessel.topBoundary, this.vessel.bottomBoundary)
        );
    }

    update() {
        for (let c of this.cells) {
            if (!c.isDead() && !c.isOutsideVessel()) {
                let force = this.vessel.getVector(c.pos.x, c.pos.y);
                c.addForce(force);
                c.applyDrag(this.dragCoefficient);
            }
            c.update();
            if (c.isDead()) {
                this.cells.splice(this.cells.indexOf(c), 1);
            }
        }
    }
}
