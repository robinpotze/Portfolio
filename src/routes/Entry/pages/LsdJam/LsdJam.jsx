import DoubleImage from '@components/ui/DoubleImage/DoubleImage';
import FullImage from '@components/ui/FullImage/FullImage';
import WorkHeader from '@components/ui/WorkHeader/WorkHeader';

const assetPath = '/img/work/lsdjam/';

export default function LsdJam() {
    return (
        <>
            <FullImage src={`${assetPath}hibernation.png`} alt="A retro-futurist room with a VR setup in the middle." contain />
            <FullImage src={`${assetPath}SpaceShip.png`} alt="Low fidelity render of a spaceship bridge." thin />
            <WorkHeader
                title="COMMAND_ROOM"
                subtitle="LVL_001:::HIBERNATION"
                description="The first actual level of the game has you, the player, wake up from cryosleep in an unknown spaceship. As you navigate the narrow hallways, large storage rooms, and eventually end up on the bridge, you realize you have awakened due to a system error, the sun is burning away the ship's system as you've steered off-course."
            />
            <DoubleImage
                images={[
                    { src: `${assetPath}CasetteWire.png`, alt: 'The wireframe of the CassetteRoom scene' },
                    { src: `${assetPath}CassetteRoom.png`, alt: 'A retro-futurist room with a VR setup in the middle.' },
                ]}
            />
        </>
    );
}
