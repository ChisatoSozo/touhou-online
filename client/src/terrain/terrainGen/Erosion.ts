import seedRandom from 'seedrandom';

interface prng {
    (): number;
    double(): number;
    int32(): number;
    quick(): number;
    state(): seedRandom.State;
}

interface HeightAndGradient {
    height: number;
    gradientX: number;
    gradientY: number;
}

const randomIntFromInterval = (prng: prng, min: number, max: number) => {
    // min and max included
    return Math.floor(prng() * (max - min + 1) + min);
};

const getZIndex = (index: number) => {
    return index * 3 + 1;
};

export class Erosion {
    public seed = 0;
    public erosionRadius = 3;
    public inertia = 0.05; // At zero, water will instantly change direction to flow downhill. At 1, water will never change direction.
    public sedimentCapacityFactor = 4; // Multiplier for how much sediment a droplet can carry
    public minSedimentCapacity = 0.01; // Used to prevent carry capacity getting too close to zero on flatter terrain
    public erodeSpeed = 0.4;
    public depositSpeed = 0.4;
    public evaporateSpeed = 0.01;
    public gravity = 4;
    public maxDropletLifetime = 30;

    public initialWaterVolume = 1.5;
    public initialSpeed = 1.5;

    // Indices and weights of erosion brush precomputed for every node
    private erosionBrushIndices: number[][] = [[]];
    private erosionBrushWeights: number[][] = [[]];

    private currentSeed = 0;
    private currentErosionRadius = 0;
    private currentMapSizeX = 0;
    private currentMapSizeY = 0;
    private prng: prng = seedRandom('');

    // Initialization creates a System.Random object and precomputes indices and weights of erosion brush
    Initialize = (mapSizeX: number, mapSizeY: number, resetSeed: boolean) => {
        if (resetSeed || this.currentSeed != this.seed) {
            this.prng = seedRandom('' + this.seed);
            this.currentSeed = this.seed;
        }

        if (
            this.erosionBrushIndices == null ||
            this.currentErosionRadius != this.erosionRadius ||
            this.currentMapSizeX != mapSizeX ||
            this.currentMapSizeY != mapSizeY
        ) {
            this.InitializeBrushIndices(mapSizeX, mapSizeY, this.erosionRadius);
            this.currentErosionRadius = this.erosionRadius;
            this.currentMapSizeX = mapSizeX;
            this.currentMapSizeY = mapSizeY;
        }
    };

    public Erode = (map: Float32Array, mapSizeX: number, mapSizeY: number, numIterations = 1, resetSeed = false) => {
        this.Initialize(mapSizeX, mapSizeY, resetSeed);

        for (let iteration = 0; iteration < numIterations; iteration++) {
            // Create water droplet at random point on map
            let posX = randomIntFromInterval(this.prng, 0, mapSizeX - 1);
            let posY = randomIntFromInterval(this.prng, 0, mapSizeY - 1);
            let dirX = 0;
            let dirY = 0;
            let speed = this.initialSpeed;
            let water = this.initialWaterVolume;
            let sediment = 0;

            for (let lifetime = 0; lifetime < this.maxDropletLifetime; lifetime++) {
                const nodeX = Math.floor(posX);
                const nodeY = Math.floor(posY);
                const dropletIndex = nodeY * mapSizeX + nodeX;
                // Calculate droplet's offset inside the cell (0,0) = at NW node, (1,1) = at SE node
                const cellOffsetX = posX - nodeX;
                const cellOffsetY = posY - nodeY;

                // Calculate droplet's height and direction of flow with bilinear interpolation of surrounding heights
                const heightAndGradient: HeightAndGradient = this.CalculateHeightAndGradient(map, mapSizeX, mapSizeY, posX, posY);

                // Update the droplet's direction and position (move position 1 unit regardless of speed)
                dirX = dirX * this.inertia - heightAndGradient.gradientX * (1 - this.inertia);
                dirY = dirY * this.inertia - heightAndGradient.gradientY * (1 - this.inertia);

                if (isNaN(dirX) || isNaN(dirY)) {
                    break;
                }

                // Normalize direction
                const len = Math.sqrt(dirX * dirX + dirY * dirY);

                if (len != 0) {
                    dirX /= len;
                    dirY /= len;
                }

                posX += dirX;
                posY += dirY;

                // Stop simulating droplet if it's not moving or has flowed over edge of map
                if ((dirX == 0 && dirY == 0) || posX < 0 || posX >= mapSizeX - 1 || posY < 0 || posY >= mapSizeY - 1) {
                    break;
                }

                // Find the droplet's new height and calculate the deltaHeight
                const newHeight = this.CalculateHeightAndGradient(map, mapSizeX, mapSizeY, posX, posY).height;
                const deltaHeight = newHeight - heightAndGradient.height;

                // Calculate the droplet's sediment capacity (higher when moving fast down a slope and contains lots of water)
                const sedimentCapacity = Math.max(
                    -deltaHeight * speed * water * this.sedimentCapacityFactor,
                    this.minSedimentCapacity,
                );

                // If carrying more sediment than capacity, or if flowing uphill:
                if (sediment > sedimentCapacity || deltaHeight > 0) {
                    // If moving uphill (deltaHeight > 0) try fill up to the current height, otherwise deposit a fraction of the excess sediment
                    const amountToDeposit =
                        deltaHeight > 0 ? Math.min(deltaHeight, sediment) : (sediment - sedimentCapacity) * this.depositSpeed;
                    sediment -= amountToDeposit;

                    // Add the sediment to the four nodes of the current cell using bilinear interpolation
                    // Deposition is not distributed over a radius (like erosion) so that it can fill small pits
                    map[getZIndex(dropletIndex)] += amountToDeposit * (1 - cellOffsetX) * (1 - cellOffsetY);
                    map[getZIndex(dropletIndex + 1)] += amountToDeposit * cellOffsetX * (1 - cellOffsetY);
                    map[getZIndex(dropletIndex + mapSizeX)] += amountToDeposit * (1 - cellOffsetX) * cellOffsetY;
                    map[getZIndex(dropletIndex + mapSizeX + 1)] += amountToDeposit * cellOffsetX * cellOffsetY;
                } else {
                    // Erode a fraction of the droplet's current carry capacity.
                    // Clamp the erosion to the change in height so that it doesn't dig a hole in the terrain behind the droplet
                    const amountToErode = Math.min((sedimentCapacity - sediment) * this.erodeSpeed, -deltaHeight);

                    // Use erosion brush to erode from all nodes inside the droplet's erosion radius
                    try {
                        for (
                            let brushPointIndex = 0;
                            brushPointIndex < this.erosionBrushIndices[dropletIndex].length;
                            brushPointIndex++
                        ) {
                            const nodeIndex = this.erosionBrushIndices[dropletIndex][brushPointIndex];
                            const weighedErodeAmount = amountToErode * this.erosionBrushWeights[dropletIndex][brushPointIndex];
                            const deltaSediment =
                                map[getZIndex(nodeIndex)] < weighedErodeAmount ? map[getZIndex(nodeIndex)] : weighedErodeAmount;
                            map[getZIndex(nodeIndex)] -= deltaSediment;
                            sediment += deltaSediment;
                        }
                    } catch {
                        return;
                    }
                }

                // Update droplet's speed and water content
                speed = Math.sqrt(Math.max(speed * speed + deltaHeight * this.gravity, 0));

                water *= 1 - this.evaporateSpeed;
            }
        }
    };

    private CalculateHeightAndGradient: (
        nodes: Float32Array,
        mapSizeX: number,
        mapSizeY: number,
        posX: number,
        posY: number,
    ) => HeightAndGradient = (nodes, mapSizeX, mapSizeY, posX, posY) => {
        const coordX = Math.floor(posX);
        const coordY = Math.floor(posY);

        // Calculate droplet's offset inside the cell (0,0) = at NW node, (1,1) = at SE node
        const x = posX - coordX;
        const y = posY - coordY;

        // Calculate heights of the four nodes of the droplet's cell
        const nodeIndexNW = coordY * mapSizeX + coordX;
        const heightNW = nodes[getZIndex(nodeIndexNW)];
        const heightNE = nodes[getZIndex(nodeIndexNW + 1)];
        const heightSW = nodes[getZIndex(nodeIndexNW + mapSizeX)];
        const heightSE = nodes[getZIndex(nodeIndexNW + mapSizeX + 1)];

        // Calculate droplet's direction of flow with bilinear interpolation of height difference along the edges
        const gradientX = (heightNE - heightNW) * (1 - y) + (heightSE - heightSW) * y;
        const gradientY = (heightSW - heightNW) * (1 - x) + (heightSE - heightNE) * x;

        // Calculate height with bilinear interpolation of the heights of the nodes of the cell
        const height = heightNW * (1 - x) * (1 - y) + heightNE * x * (1 - y) + heightSW * (1 - x) * y + heightSE * x * y;

        return { height, gradientX, gradientY };
    };

    private InitializeBrushIndices = (mapSizeX: number, mapSizeY: number, radius: number) => {
        this.erosionBrushIndices = [];
        this.erosionBrushWeights = [];

        const xOffsets: number[] = [];
        const yOffsets: number[] = [];
        const weights: number[] = [];
        let weightSum = 0;
        let addIndex = 0;

        for (let i = 0; i < mapSizeX * mapSizeY; i++) {
            const centreX = i % mapSizeX;
            const centreY = i / mapSizeX;

            if (centreY <= radius || centreY >= mapSizeY - radius || centreX <= radius + 1 || centreX >= mapSizeX - radius) {
                weightSum = 0;
                addIndex = 0;
                for (let y = -radius; y <= radius; y++) {
                    for (let x = -radius; x <= radius; x++) {
                        const sqrDst = x * x + y * y;
                        if (sqrDst < radius * radius) {
                            const coordX = centreX + x;
                            const coordY = centreY + y;

                            if (coordX >= 0 && coordX < mapSizeX && coordY >= 0 && coordY < mapSizeY) {
                                const weight = 1 - Math.sqrt(sqrDst) / radius;
                                weightSum += weight;
                                weights[addIndex] = weight;
                                xOffsets[addIndex] = x;
                                yOffsets[addIndex] = y;
                                addIndex++;
                            }
                        }
                    }
                }
            }

            const numEntries = addIndex;
            this.erosionBrushIndices[i] = [];
            this.erosionBrushWeights[i] = [];

            for (let j = 0; j < numEntries; j++) {
                this.erosionBrushIndices[i][j] = (yOffsets[j] + centreY) * mapSizeX + xOffsets[j] + centreX;
                this.erosionBrushWeights[i][j] = weights[j] / weightSum;
            }
        }
    };
}
