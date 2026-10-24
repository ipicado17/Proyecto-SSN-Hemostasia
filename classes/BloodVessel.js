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

    display() {
        this.body.display();

        //dibujar las células endoteliales
        for (const cell of this.endothelialCells) {
            cell.display();
        }
    }
}
