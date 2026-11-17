let skin;
let collagenRatio;
let woundWidth;
let woundArgs = {
    collagenRatio: 50,
    width: 100,
    maxGrowth: 30,
};

let sliderRedBloodCells;
let labelRedBloodCells;
let valueRedBloodCells;
let redBloodCellsPerSpawn = 1;

let sliderPlatelets;
let labelPlatelets;
let valuePlatelets;
let plateletsPerSpawn = 1;

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent("canvas-container");
    canvas.mousePressed(() => skin.createWound(mouseX));
    createSliders();
    resetSimulation();
}

function draw() {
    background(240);

    // Generar una célula cada 30 frames
    if (frameCount % 30 === 0) {
        for (let i = 0; i < redBloodCellsPerSpawn; i++) {
            skin.addRedBloodCell(random(100, 150));
        }

        for (let i = 0; i < plateletsPerSpawn; i++) {
            skin.addPlatelet(random(100, 150));
        }
    }

    skin.update();
    skin.display();
    valueRedBloodCells.html("Valor actual: " + sliderRedBloodCells.value());
    valuePlatelets.html("Valor actual: " + sliderPlatelets.value());
    debug();
}

function debug() {
    if (frameCount % 120 === 0) {
        const platelets = skin.cells.filter(
            c => c instanceof Platelet
        );

        console.table({
            fps: frameRate().toFixed(1),
            total: platelets.length,
            estado0: platelets.filter(c => c.state === 0).length,
            estado1: platelets.filter(c => c.state === 1).length,
            estado2: platelets.filter(c => c.state === 2).length,
            heridaCerrada: skin.wound.closed,
            fibrin: skin.readyToApplyFribrin()
        });
    }
}

function keyPressed() {
    if (key.toLowerCase() === "r") {
        resetSimulation();
    }
}

function createSliders() {
    let slidersContainer = select("#sliders-container");

    // Eritrocitos
    let groupRbc = createDiv();
    groupRbc.addClass("slider-group");
    groupRbc.parent(slidersContainer);

    labelRedBloodCells = createDiv("Eritrocitos por generación");
    labelRedBloodCells.addClass("slider-label");
    labelRedBloodCells.parent(groupRbc);

    sliderRedBloodCells = createSlider(0, 5, 1, 0.25);
    sliderRedBloodCells.addClass("simulation-slider");
    sliderRedBloodCells.parent(groupRbc);

    valueRedBloodCells = createDiv("Valor actual: 1");
    valueRedBloodCells.addClass("slider-value");
    valueRedBloodCells.parent(groupRbc);

    // Plaquetas
    let groupPlatelets = createDiv();
    groupPlatelets.addClass("slider-group");
    groupPlatelets.parent(slidersContainer);

    labelPlatelets = createDiv("Plaquetas por generación");
    labelPlatelets.addClass("slider-label");
    labelPlatelets.parent(groupPlatelets);

    sliderPlatelets = createSlider(0, 5, 1, 0.25);
    sliderPlatelets.addClass("simulation-slider");
    sliderPlatelets.parent(groupPlatelets);

    valuePlatelets = createDiv("Valor actual: 1");
    valuePlatelets.addClass("slider-value");
    valuePlatelets.parent(groupPlatelets);
}

function resetSimulation() {
    redBloodCellsPerSpawn = sliderRedBloodCells.value();
    plateletsPerSpawn = sliderPlatelets.value();
    skin = new Skin(width, height, woundArgs, Math.floor(random(1000000)));
}