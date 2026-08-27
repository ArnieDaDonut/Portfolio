function hash2d(x: number, z: number, seed: number) {
    const n = Math.sin(x * 12.9898 + z * 78.233 + seed * 43758.5453) * 43758.5453
    return n - Math.floor(n);
}

function noise2d(x: number, z: number, seed: number) {
    const iX = Math.floor(x);
    const iZ = Math.floor(z);
    const fX = x - iX;
    const fZ = z - iZ;

    const u = fX * fX * (3.0 - 2.0 * fX);
    const v = fZ * fZ * (3.0 - 2.0 * fZ);

    const a = hash2d(iX, iZ, seed);
    const b = hash2d(iX + 1, iZ, seed);
    const c = hash2d(iX, iZ + 1, seed);
    const d = hash2d(iX + 1, iZ + 1, seed);

    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function getTerrainHeight(x: number, z: number, planetName: string) {
    let seed = 0;
    if (planetName) {
        for (let i = 0; i < planetName.length; i++) {
            seed = (seed << 5) - seed + planetName.charCodeAt(i);
            seed |= 0;
        }
    }

    const nx = x * 0.025;
    const nz = z * 0.025;

    let height = noise2d(nx, nz, seed) * 10.0;
    height += noise2d(nx * 2.5, nz * 2.5, seed + 100) * 3.5;

    height += noise2d(nx * 6.0, nz * 6.0, seed + 200);

    const distFromCenter = Math.min(Math.sqrt(x * x + z * z) / 12, 1.0);

    return (height - 5.0) * distFromCenter;
}
