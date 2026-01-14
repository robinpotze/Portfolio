import ScrollReveal from '@components/effects/ScrollReveal';
import DashLine from '@components/decoration/DashLine';

export const Data = {
    id: 1,
    title: "LSD JAM",
    synopsis: "Where games meet drugs",
    description: "LSD Jam is a game jam I participated in during April 2024 together with Cyril Ojoga. The theme was LSD, and the goal was to create a game that makes the player question which of the realities they experience is their actual life. The game takes the player through a series of realities, dying and waking up after a short series of events in each one. I created the 3D art, Textures, level layouts and lighting setups for the jam, as well as the promotional material. The game was made in Unity, and the 3D art was created in Blender.",
    client: "TRIPADVISORS",
    year: 2024,
    software: ["Illustrator", "Unity", "Blender"],
    skills: ["Adobe Illustrator", "Figma", "Unity", "Blender"],
    banner: "/img/work/lsdjam/Corridor.png"
}

export default function LsdJam() {
    return (
        <div>
            <div className='work-full'>
                <img src='/img/work/lsdjam/hibernation.png' className='img-full-width' alt='A retro-futurist room with a VR setup in the middle.' />
            </div>
            <div className='work-full-thin'>
                <img src='/img/work/lsdjam/SpaceShip.png' alt='low fidelity render of a spaceship bridge.' />
            </div>
            <div className='work-header'>
                <div className='work-header-chapter'>
                    <h3>THE COMMAND ROOM</h3>
                    <img src='/img/icon/PLS.svg' alt='plus icon divider' />
                    <p className='tech-small'>LVL::001 - HIBERNATION</p>
                </div>
                <ScrollReveal>
                    Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos
                </ScrollReveal>
            </div>
            <div className='work-double'>
                <img src='/img/work/lsdjam/CasetteWire.png' alt='The wireframe of the CassetteRoom scene' />
                <DashLine direction="Vertical" />
                <img src='/img/work/lsdjam/CassetteRoom.png' alt='A retro-futurist room with a VR setup in the middle.' />
            </div>
        </div>
    );
}