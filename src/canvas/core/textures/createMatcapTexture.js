import * as THREE from 'three';

const SIZE = 256;

/** Procedural metallic matcap: dark rim, steel mid-tones, soft highlight upper-left. */
export default function createMatcapTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    const r = SIZE / 2;

    const body = ctx.createRadialGradient(r, r, 0, r, r, r);
    body.addColorStop(0, '#a4a9af');
    body.addColorStop(0.65, '#4b5057');
    body.addColorStop(1, '#0c0d0f');
    ctx.fillStyle = body;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const highlight = ctx.createRadialGradient(r * 0.7, r * 0.6, 0, r * 0.7, r * 0.6, r * 0.55);
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlight;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}
