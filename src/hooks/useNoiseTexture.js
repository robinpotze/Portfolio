import { useMemo } from 'react'
import * as THREE from 'three'

export default function useNoiseTexture({
    size = 512,
    scale = 10,
    octaves = 4,
    persistence = 0.5,
    wrapS = THREE.RepeatWrapping,
    wrapT = THREE.RepeatWrapping
} = {}) {
    return useMemo(() => {
        const data = new Uint8Array(size * size * 4)

        // Simple hash-based noise
        const hash = (x, y) => {
            const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
            return h - Math.floor(h)
        }

        // Bilinear interpolation
        const smoothNoise = (x, y) => {
            const ix = Math.floor(x)
            const iy = Math.floor(y)
            const fx = x - ix
            const fy = y - iy

            const ux = fx * fx * (3 - 2 * fx)
            const uy = fy * fy * (3 - 2 * fy)

            const a = hash(ix, iy)
            const b = hash(ix + 1, iy)
            const c = hash(ix, iy + 1)
            const d = hash(ix + 1, iy + 1)

            return a * (1 - ux) * (1 - uy) +
                b * ux * (1 - uy) +
                c * (1 - ux) * uy +
                d * ux * uy
        }

        // Generate fractal noise
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const idx = (y * size + x) * 4
                const nx = x / size * scale
                const ny = y / size * scale

                let value = 0
                let amplitude = 1
                let frequency = 1
                let maxValue = 0

                // Layer octaves
                for (let i = 0; i < octaves; i++) {
                    value += smoothNoise(nx * frequency, ny * frequency) * amplitude
                    maxValue += amplitude
                    amplitude *= persistence
                    frequency *= 2
                }

                // Normalize
                value = (value / maxValue) * 255

                data[idx] = value
                data[idx + 1] = value
                data[idx + 2] = value
                data[idx + 3] = 255
            }
        }

        const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
        texture.wrapS = wrapS
        texture.wrapT = wrapT
        texture.needsUpdate = true

        return texture
    }, [size, scale, octaves, persistence, wrapS, wrapT])
}