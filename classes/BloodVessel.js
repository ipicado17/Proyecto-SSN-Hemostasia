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

        this.endothelialCells = [];
        this.generateEndothelialCells();

        // Atributos para el flowfield
        // Atributos de noise
        this.noiseX = 0.6;
        this.noiseY = 0.6;
        this.noiseZ = 0.6;
        this.noiseChange = 0.01;

        // Atributos de la matriz
        this.rows;
        this.cols;
        this.gap = 25;
        this.size = 50;
        this.defaultMag = 30;
        this.flowfield = [];
        this.generateFlowField();
    }

    generateEndothelialCells() {
        const cellWidth = 30;
        const cellHeight = 10;
        const gap = 2;

        //cantidad de células necesarias para cubrir el ancho
        const count = Math.ceil(this.width / (cellWidth + gap));
        //distancia entre los centros de las células
        const spacing = this.width / count;
        //ancho ajustado para mantener la separación
        const adjustedWidth = spacing - gap;

        //recorrer ambas paredes del vaso
        for (const boundary of [this.topBoundary, this.bottomBoundary]) {
            //si es 1, es la pared superior, si es -1, es la pared inferior
            const side = boundary === this.topBoundary ? 1 : -1;
            for (let i = 0; i < count; i++) {
                //calcular la posición horizontal del centro de la célula
                const x = Math.round((i + 0.5) * spacing);
                //calcular 2 puntos cercanos al centro de la célula
                const x1 = Math.max(0, x - 10);
                const x2 = Math.min(this.width, x + 10);
                //calcular el ángulo de inclinación con los puntos cercanos
                const angle = Math.atan2(boundary[x2] - boundary[x1], x2 - x1);
                //calcular vector perpendicular a la pared
                //para dibujar las celulas en el interior del vaso en lugar de sobre el borde
                const normalX = -Math.sin(angle) * side;
                const normalY = Math.cos(angle) * side;
                //calcular el centro de la célula
                //luego del desplazamiento hacia el interior del vaso
                const centerX = x + normalX * cellHeight / 2;
                const centerY = boundary[x] + normalY * cellHeight / 2;
                //crear el objeto de célula endotelial
                this.endothelialCells.push(new EndothelialCell(centerX, centerY, adjustedWidth, cellHeight, angle));
            }
        }
    }

    generateFlowField() {
        // Promedio de posiciones en y para bottom y para top
        let avgTop = this.topBoundary.reduce((sum, y) => sum + y, 0) / 
                     this.topBoundary.length;
        let avgBot = this.bottomBoundary.reduce((sum, y) => sum + y, 0) / 
                     this.bottomBoundary.length;

        let numberRows = avgBot - avgTop - 2 * this.gap;

        this.rows = floor(numberRows / this.size);
        this.cols = floor(width / this.size);

        for (let i = 0; i < this.rows; i++) {
            this.flowfield[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.flowfield[i][j] = createVector(0, 0, 0);
            }
        }
    }

    updateFlowField() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let value = noise(j * this.noiseX, i * this.noiseY, this.noiseZ);
                let angle = map(value, 0, 1, -PI / 3, PI / 3);

                let v = p5.Vector.fromAngle(angle);
                v.setMag(this.defaultMag);

                this.flowfield[i][j] = v;
            }
        }
        this.noiseZ += this.noiseChange;
    }

    getVector(x, y) {
        const col = floor(x / this.size);

        // Acceso a y desde x, por las peredes irregulares del vaso
        const vesselY = this.topBoundary[constrain(round(x), 0, this.topBoundary.length - 1)];
        const row = floor((y - vesselY - this.gap) / this.size);

        // Los constrain evitan que el índice se salga del arreglo y agarre el más cercano
        return this.flowfield[constrain(row, 0, this.rows - 1)][constrain(col, 0, this.cols - 1)];
    }

    displayFlowField() {
        const gap = 25;
        let startY = this.topBoundary[0] + gap;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let x = j * this.size;
                let y = startY + i * this.size;

                // ** Dibujar la celda **
                noFill();
                stroke(0, 255, 0);
                strokeWeight(0.5);
                rect(x, y, this.size, this.size);

                // ** Obtener el vector del flowfield **
                let v = this.flowfield[i][j];

                push();

                // Trasladar al centro de la celda
                translate(x + this.size / 2, y + this.size / 2);

                // Girar según la dirección del vector
                rotate(v.heading());

                // Dibujar la flecha
                stroke(255, 255, 0);
                strokeWeight(2);
                line(-v.mag(), 0, v.mag(), 0);

                pop();
            }
        }
    }

    display() {
        this.body.display();

        //this.displayFlowField();

        //dibujar las células endoteliales
        for (const cell of this.endothelialCells) {
            cell.display();
        }
    }
}
