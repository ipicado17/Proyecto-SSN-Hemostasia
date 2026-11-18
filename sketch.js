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

let sliderPlateletsToClose;
let labelPlateletsToClose;
let valuePlateletsToClose;
let plateletsToClose = 25;

let sliderPlateletAdhesion;
let labelPlateletAdhesion;
let valuePlateletAdhesion;
let plateletAdhesion = 100;

let sliderPlateletAttraction;
let valuePlateletAttraction;

let sliderFibrinSpeed;
let valueFibrinSpeed;

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

    skin.plateletAttraction = sliderPlateletAttraction.value() / 100;
    valuePlateletAttraction.html("Valor actual: " + sliderPlateletAttraction.value() + "%");
    skin.fibrinSpringsPerStep = sliderFibrinSpeed.value();
    valueFibrinSpeed.html("Valor actual: " + sliderFibrinSpeed.value() + " frames");

    valueRedBloodCells.html("Valor actual: " + sliderRedBloodCells.value());
    valuePlatelets.html("Valor actual: " + sliderPlatelets.value());
    valuePlateletsToClose.html("Valor actual: " + sliderPlateletsToClose.value());
    valuePlateletAdhesion.html("Valor actual: " + sliderPlateletAdhesion.value() + "%");
    
    skin.update();
    skin.display();
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
            fibrin: skin.readyToApplyFribrin(),
            plaquetas: skin.cells.filter(c => c instanceof Platelet).length,
            eritrocitos: skin.cells.filter(c => c instanceof RedBloodCell).length
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

    sliderRedBloodCells = createSlider(0, 3, 1, 0.10);
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

    sliderPlatelets = createSlider(0, 3, 1, 0.10);
    sliderPlatelets.addClass("simulation-slider");
    sliderPlatelets.parent(groupPlatelets);

    valuePlatelets = createDiv("Valor actual: 1");
    valuePlatelets.addClass("slider-value");
    valuePlatelets.parent(groupPlatelets);

    // Plaquetas necesarias para cerrar el tapón
    let groupPlateletsToClose = createDiv();
    groupPlateletsToClose.addClass("slider-group");
    groupPlateletsToClose.parent(slidersContainer);

    labelPlateletsToClose = createDiv("Plaquetas necesarias para cerrar el tapón");
    labelPlateletsToClose.addClass("slider-label");
    labelPlateletsToClose.parent(groupPlateletsToClose);

    sliderPlateletsToClose = createSlider(5, 25, 20, 1);
    sliderPlateletsToClose.addClass("simulation-slider");
    sliderPlateletsToClose.parent(groupPlateletsToClose);

    valuePlateletsToClose = createDiv("Valor actual: 25");
    valuePlateletsToClose.addClass("slider-value");
    valuePlateletsToClose.parent(groupPlateletsToClose);

    //porcentaje de adhesion platelaria
    let groupPlateletAdhesion = createDiv();
    groupPlateletAdhesion.addClass("slider-group");
    groupPlateletAdhesion.parent(slidersContainer);

    labelPlateletAdhesion = createDiv("Capacidad de adhesión plaquetaria");
    labelPlateletAdhesion.addClass("slider-label");
    labelPlateletAdhesion.parent(groupPlateletAdhesion);

    sliderPlateletAdhesion = createSlider(0, 100, 100, 5);
    sliderPlateletAdhesion.addClass("simulation-slider");
    sliderPlateletAdhesion.parent(groupPlateletAdhesion);

    valuePlateletAdhesion = createDiv("Valor actual: 100%");
    valuePlateletAdhesion.addClass("slider-value");
    valuePlateletAdhesion.parent(groupPlateletAdhesion);

    // Intensidad de atracción plaquetaria
    let groupPlateletAttraction = createDiv();
    groupPlateletAttraction.addClass("slider-group");
    groupPlateletAttraction.parent(slidersContainer);

    let labelPlateletAttraction = createDiv("Intensidad de atracción plaquetaria");
    labelPlateletAttraction.addClass("slider-label");
    labelPlateletAttraction.parent(groupPlateletAttraction);

    sliderPlateletAttraction = createSlider(0, 100, 50, 10);
    sliderPlateletAttraction.addClass("simulation-slider");
    sliderPlateletAttraction.parent(groupPlateletAttraction);

    valuePlateletAttraction = createDiv("Valor actual: 100%");
    valuePlateletAttraction.addClass("slider-value");
    valuePlateletAttraction.parent(groupPlateletAttraction);

    // Velocidad de formación de fibrina
    let groupFibrinSpeed = createDiv();
    groupFibrinSpeed.addClass("slider-group");
    groupFibrinSpeed.parent(slidersContainer);

    let labelFibrinSpeed = createDiv("Velocidad de formación de fibrina");
    labelFibrinSpeed.addClass("slider-label");
    labelFibrinSpeed.parent(groupFibrinSpeed);

    sliderFibrinSpeed = createSlider(0, 12, 3, 1);
    sliderFibrinSpeed.addClass("simulation-slider");
    sliderFibrinSpeed.parent(groupFibrinSpeed);

    valueFibrinSpeed = createDiv("Valor actual: 3 conexiones / 4 fotogramas");
    valueFibrinSpeed.addClass("slider-value");
    valueFibrinSpeed.parent(groupFibrinSpeed);
}

function resetSimulation() {
    redBloodCellsPerSpawn = sliderRedBloodCells.value();
    plateletsPerSpawn = sliderPlatelets.value();
    plateletsToClose = sliderPlateletsToClose.value();
    plateletAdhesion = sliderPlateletAdhesion.value();

    skin = new Skin(width, height, woundArgs, Math.floor(random(1000000)));

    skin.plateletsToClose = plateletsToClose;
    skin.plateletAdhesion = plateletAdhesion / 100;
    skin.plateletAttraction = sliderPlateletAttraction.value() / 100;
    skin.fibrinSpringsPerStep = sliderFibrinSpeed.value();
}