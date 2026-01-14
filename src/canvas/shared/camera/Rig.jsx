import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

export default function Rig({ intensity = 0.5 }) {
    const offsetRef = useRef({ x: 0, y: 0, z: 0 })

    useFrame((state, delta) => {
        const targetOffsetX = Math.sin(-state.pointer.x) * 5 * intensity
        const targetOffsetY = state.pointer.y * 5 * intensity
        const targetOffsetZ = Math.cos(state.pointer.x) * 5 * intensity

        const smoothing = Math.min(1 - Math.pow(0.001, delta), 1) * 0.5

        // Lerp offsets
        offsetRef.current.x += (targetOffsetX - offsetRef.current.x) * smoothing
        offsetRef.current.y += (targetOffsetY - offsetRef.current.y) * smoothing
        offsetRef.current.z += (targetOffsetZ - offsetRef.current.z) * smoothing

        // Apply offset (camera position is managed by useCameraAnimation)
        // This only adds the mouse parallax offset on top
        const basePos = state.camera.position
        state.camera.position.set(
            basePos.x + offsetRef.current.x,
            basePos.y + offsetRef.current.y,
            basePos.z + offsetRef.current.z
        )

        state.camera.lookAt(0, 0, 0)
    })

    return null
}