let skin;
let collagenRatio;
let woundWidth;
let woundArgs = {
        collagenRatio: 50,
        width: 100,
        maxGrowth: 30,
};

function setup() {
    createCanvas(800, 600);

    skin = new Skin(width, height, woundArgs, 12345);
}

function draw() {
    background(240);

    // Generar una célula cada 30 frames
    if (frameCount % 20 === 0) {
        skin.addCell(random(100, 150));
    }

    skin.update();
    skin.display();
}

function mousePressed() {
    skin.createWound(floor(mouseX));
}

function keyPressed() {
    if (key.toLowerCase() === "r") {
        skin = new Skin(
            width,
            height,
            woundArgs,
            Math.floor(random(1000000))
        );
    }
}