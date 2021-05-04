var population;
var lifespan = 350;
var lifeP;
var fitnessP;
var bestFitness = 0;
var count = 0;
var target;
var maxForce = 0.7;
var bestDNA;
var bestRocket;
var bestTime = Infinity;
var countt;
var first = Infinity;
var firstt;
var rx = 0;
var ry = 280;
var rw = 345;
var rh = 15;

var rx1 = 230;
var ry1 = 150;
var rw1 = 375;
var rh1 = 15;

var rx2 = 0;
var ry2 = 80;
var rw2 = 280
var rh2 = 15;

var rx3 = 380;
var ry3 = 350;
var rw3 = 8;
var rh3 = 260;
var y = 500;

var inp;

function setup() {
    var canvas = createCanvas(500, 500);
    population = new Population(y);
    lifeP = createP();
    fitnessP = createP();
    countt = createP();
    firstt = createP();
    inp = createP();
    target = createVector(width / 2, height);
    bestDNA = new DNA();
    bestRocket = new Rocket(bestDNA);

    // inp.html("Population Size::");
    // input = createInput(value = 500);
    // input.position(920, 810);
    // button = createButton('submit');
    // button.position(input.x + input.width, 810);
    // button.mousePressed(() => {
    //     console.log(input.value());
    //     y = input.value();
    //     population = new Population(y);
    // })
    canvas.parent('my');
    lifeP.parent('my');
    fitnessP.parent('my');
    countt.parent('my');
    //inp.parent('my');
    firstt.parent('my');

}
var co = 0;

function draw() {
    background(50);
    population.run();

    bestRocket.update();
    bestRocket.showHighlighted();
    countt.html("Generations: " + co);
    firstt.html('First Success: ' + first);
    lifeP.html("Best Time: " + bestTime);
    fitnessP.html("Best Fitness: " + bestFitness);
    count++;

    if (count == lifespan) {
        count = 0;
        co = co + 1;
        //population = new Population();
        population.evaluate();
        population.selection();
        bestRocket = new Rocket(bestDNA);
    }

    fill(255);
    rect(rx, ry, rw, rh);
    rect(rx1, ry1, rw1, rh1);
    rect(rx2, ry2, rw2, rh2);
    rect(rx3, ry3, rw3, rh3);
    rect(target.x, target.y, 50, 50)
    ellipse(target.x, target.y, 16)
    const ctx = canvas.getContext('2d');

    const colors = ['#E7E6DD', 'White', 'Black'];
    const outerRadius = 50;
    let bandSize = 5; // this would be where you put the value for your slider

    for (let r = outerRadius, colorIndex = 0; r > 0; r -= bandSize, colorIndex = (colorIndex + 1) % colors.length) {
        ctx.fillStyle = colors[colorIndex];
        ctx.beginPath();
        ctx.arc(target.x, target.y, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}


function Population(y) {
    this.rockets = [];
    this.popsize = y;
    this.matingpool = [];

    for (var i = 0; i < this.popsize; i++) {
        this.rockets[i] = new Rocket();
    }

    this.run = function() {
        for (var i = 0; i < this.popsize; i++) {
            this.rockets[i].update();
            this.rockets[i].show();
        }
    }

    this.evaluate = function() {
        var maxfit = 0;
        for (var i = 0; i < this.popsize; i++) {
            this.rockets[i].calcFitness();
            if (this.rockets[i].fitness > maxfit) {
                maxfit = this.rockets[i].fitness;
                bestDNA = this.rockets[i].dna;
            }
        }

        if (maxfit > bestFitness)
            bestFitness = maxfit;

        for (var i = 0; i < this.popsize; i++) {
            this.rockets[i].fitness /= maxfit;
        }

        this.matingpool = [];
        for (var i = 0; i < this.popsize; i++) {
            var n = this.rockets[i].fitness * 100;
            for (var j = 0; j < n; j++)
                this.matingpool.push(this.rockets[i]);
        }

    }

    this.selection = function() {
        var newRockets = [];

        for (var i = 0; i < this.rockets.length; i++) {
            var parentA = random(this.matingpool).dna;
            var parentB = random(this.matingpool).dna;
            var child = parentA.crossover(parentB);
            child.mutation();
            newRockets[i] = new Rocket(child)
        }

        this.rockets = newRockets;
    }
}



function DNA(genes) {
    if (genes) {
        this.genes = genes;
    } else {
        this.genes = []
        for (var i = 0; i < lifespan; i++) {
            this.genes[i] = p5.Vector.random2D();
            this.genes[i].setMag(maxForce);
        }
    }


    this.crossover = function(partner) {
        var newgenes = [];
        var mid = floor(random(this.genes.length));
        for (var i = 0; i < this.genes.length; i++) {
            if (i > mid)
                newgenes[i] = this.genes[i];
            else
                newgenes[i] = partner.genes[i];
        }

        return new DNA(newgenes);
    }

    this.mutation = function() {
        for (var i = 0; i < this.genes.length; i++) {
            if (random(1) < 0.025) {
                this.genes[i] = p5.Vector.random2D();
                this.genes[i].setMag(maxForce);
            }
        }
    }
}

function Rocket(dna) {
    this.pos = createVector(width / 2, 0);
    this.vel = createVector();
    this.acc = createVector();
    this.fitness = 0;
    this.completed = false;
    this.crashed = false;
    this.time = 0;
    if (dna)
        this.dna = dna;
    else
        this.dna = new DNA();

    this.applyForce = function(force) {
        this.acc.add(force);
    }

    this.reset = function() {
        this.pos = createVector(width / 2, 0);
        this.vel = createVector();
        this.acc = createVector();
        this.fitness = 0;
        this.completed = false;
        this.crashed = false;
        this.time = 0;
    }

    this.update = function() {
        var d = dist(this.pos.x, this.pos.y, target.x, target.y)
        if (d < 10) {
            this.completed = true;
            this.pos = target.copy();
            if (this.time == 0)
                this.time = count;
        }

        if (this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh) {
            this.crashed = true;
            if (this.time == 0)
                this.time = count;
        }

        if (this.pos.x > rx1 && this.pos.x < rx1 + rw1 && this.pos.y > ry1 && this.pos.y < ry1 + rh1) {
            this.crashed = true;
            if (this.time == 0)
                this.time = count;
        }
        if (this.pos.x > rx2 && this.pos.x < rx2 + rw2 && this.pos.y > ry2 && this.pos.y < ry2 + rh2) {
            this.crashed = true;
            if (this.time == 0)
                this.time = count;
        }
        if (this.pos.x > rx3 && this.pos.x < rx3 + rw3 && this.pos.y > ry3 && this.pos.y < ry3 + rh3) {
            this.crashed = true;
            if (this.time == 0)
                this.time = count;
        }
        if (this.pos.x > width || this.pos.x < 0) {
            this.crashed = true;
            if (this.time == 0)
                this.time = count;
        }

        if (this.pos.y > height || this.pos.y < 0) {
            this.crashed = true;
            if (this.time == 0)
                this.time = count;
        }

        this.applyForce(this.dna.genes[count]);

        if (!this.completed && !this.crashed) {
            this.vel.add(this.acc);
            this.pos.add(this.vel);
            this.acc.mult(0);
        }
    }

    this.show = function() {
        push();
        noStroke();
        fill(255, 140);
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        rectMode(CENTER)
        rect(0, 0, 20, 13);
        pop();
    }

    this.showHighlighted = function() {
        push();
        noStroke();
        fill(255, 0, 0, 255);
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        rectMode(CENTER)
        rect(0, 0, 25, 15);
        pop();
    }

    this.calcFitness = function() {
        var d = dist(this.pos.x, this.pos.y, target.x, target.y);
        this.fitness = Math.pow(map(d, 0, height, height, 0), 2);

        if (this.completed) {
            if (bestTime == Infinity) {
                first = co;
            }
            if (this.time < bestTime) {
                bestTime = this.time;
                lifespan = bestTime + 10;
            }

            var multiplier = map(this.time, 0, lifespan, 25, 10);
            //console.log(multiplier);
            this.fitness *= multiplier;
        }

        if (this.crashed) {
            this.fitness /= d;
        }
    }
}