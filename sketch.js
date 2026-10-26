let skin;

function setup() {
    createCanvas(800, 600);

    skin = new Skin(width, height, 12345);
}

function draw() {
    background(240);

    // Generar una célula cada 30 frames
    if (frameCount % 30 === 0) {
        skin.addCell(random(100, 150));
    }
    skin.update();
    skin.display();
}

function keyPressed() {
    if (key.toLowerCase() === "r") {
        skin = new Skin(
            width,
            height,
            Math.floor(random(1000000))
        );
    }
}