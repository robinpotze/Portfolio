import ScrollReveal from '@components/effects/ScrollReveal';
import DashLine from '@components/decoration/DashLine';
import WorkHeader from '@components/ui/WorkHeader/WorkHeader';

const assetPath = '/img/work/lsdjam/';

export const Data = {
    id: 1,
    title: "LSD JAM",
    synopsis: "Where games meet drugs",
    description: "LSD Jam is a game jam I participated in during April 2024 together with Cyril Ojoga. The theme was LSD, and the goal was to create a game that makes the player question which of the realities they experience is their actual life. The game takes the player through a series of realities, dying and waking up after a short series of events in each one. I created the 3D art, Textures, level layouts and lighting setups for the jam, as well as the promotional material. The game was made in Unity, and the 3D art was created in Blender.",
    client: "TRIPADVISORS",
    year: 2024,
    software: ["Illustrator", "Unity", "Blender"],
    skills: ["Adobe Illustrator", "Figma", "Unity", "Blender"],
    banner: `${assetPath}Corridor.png`
}

export default function LsdJam() {
    return (
        <div>
            <div className='work-full'>
                <img src={`${assetPath}hibernation.png`} className='img-full-width' alt='A retro-futurist room with a VR setup in the middle.' />
            </div>
            <div className='work-full-thin'>
                <img src={`${assetPath}SpaceShip.png`} alt='low fidelity render of a spaceship bridge.' />
            </div>
            <WorkHeader 
                title="COMMAND_ROOM"
                subtitle="LVL_001:::HIBERNATION"
                description="The first actual level of the game has you, the player, wake up from cryosleep in an unknown spaceship. As you navigate the narrow hallways, large storage rooms, and eventually end up on the bridge, you realize you have awakened due to a system error, the sun is burning away the ship's system as you've steered off-course."
            />
            <div className='work-double'>
                <img src={`${assetPath}CasetteWire.png`} alt='The wireframe of the CassetteRoom scene' />
                <DashLine direction="Vertical" />
                <img src={`${assetPath}CassetteRoom.png`} alt='A retro-futurist room with a VR setup in the middle.' />
            </div>
        </div>
    );
}