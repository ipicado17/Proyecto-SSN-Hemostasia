class Fibrin {
    constructor(platelets) {
        this.platelets = platelets.slice();
        this.springs = [];
        this.pendingConnections = [];
        this.connectionCounts = [];
        this.maxConnections = 3;
        this.springsPerStep = 3;
        this.buildInterval = 4;
        this.lastBuildFrame = frameCount;
        this.started = false;
    }

    startConnections() {
        this.platelets.sort((a, b) => a.pos.x - b.pos.x);
        this.connectionCounts = Array(this.platelets.length).fill(0);

        const plannedCounts = Array(this.platelets.length).fill(0);
        const queuedPairs = new Set();

        const queueConnection = (a, b) => {
            const key = `${a}-${b}`;

            if (
                queuedPairs.has(key) ||
                plannedCounts[a] >= this.maxConnections ||
                plannedCounts[b] >= this.maxConnections
            ) {
                return;
            }

            queuedPairs.add(key);
            plannedCounts[a]++;
            plannedCounts[b]++;
            this.pendingConnections.push([a, b]);
        };

        // Primero conecta todas las plaquetas en una cadena.
        for (let i = 0; i < this.platelets.length - 1; i++) {
            queueConnection(i, i + 1);
        }

        // Añade conexiones extra respetando el máximo de 3.
        for (let gap = 2; gap < this.platelets.length; gap++) {
            for (let i = 0; i + gap < this.platelets.length; i++) {
                queueConnection(i, i + gap);
            }
        }

        this.started = true;
        this.lastBuildFrame = frameCount;
    }

    update() {
        if (!this.started) {
            const allHaveSpikes =
                this.platelets.length > 0 &&
                this.platelets.every(platelet => platelet.state === 2);

            if (!allHaveSpikes) return;

            this.startConnections();
        }

        if (
            this.pendingConnections.length > 0 &&
            frameCount - this.lastBuildFrame >= this.buildInterval
        ) {
            for (
                let i = 0;
                i < this.springsPerStep &&
                this.pendingConnections.length > 0;
                i++
            ) {
                const [a, b] = this.pendingConnections.shift();

                if (
                    this.connectionCounts[a] >= this.maxConnections ||
                    this.connectionCounts[b] >= this.maxConnections
                ) {
                    continue;
                }

                const agent1 = this.platelets[a];
                const agent2 = this.platelets[b];
                const distance = p5.Vector.dist(agent1.pos, agent2.pos);
                const restLen = distance + max(16, distance * 0.35);

                this.springs.push(
                    new FibrinSpring(agent1, agent2, 0.01, restLen)
                );
                this.connectionCounts[a]++;
                this.connectionCounts[b]++;
            }

            this.lastBuildFrame = frameCount;
        }

        for (const spring of this.springs) {
            spring.update();
        }
    }

    display() {
        push();
        stroke("#f4d58d");
        strokeWeight(1.5);

        for (const spring of this.springs) {
            line(
                spring.agent1.pos.x,
                spring.agent1.pos.y,
                spring.agent2.pos.x,
                spring.agent2.pos.y
            );
        }

        pop();
    }
}