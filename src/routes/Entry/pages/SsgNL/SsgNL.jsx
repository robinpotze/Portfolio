import DoubleImage from '@components/ui/DoubleImage/DoubleImage';
import FullImage from '@components/ui/FullImage/FullImage';
import WorkHeader from '@components/ui/WorkHeader/WorkHeader';

const assetPath = '/img/work/ssgnl/';

export default function SsgNL() {
    return (
        <>
            <FullImage src={`${assetPath}Banner.png`} alt="An exploded overview of all the projects I made for Sopra Steria Benelux." thin />
            <WorkHeader
                title="Auto|Q"
                subtitle="BRANDING:::MARKETING"
                description="I first started off in the Test Automation department of Sopra, where I quickly realized this was not a job for me. That doesn't mean I no longer wanted to work with them of course, as I became their marketing guy shortly after I swapped to JsRoots, the front-end devs."
            />

            <WorkHeader
                title="CyberScurity"
                subtitle="EDUCATION:::BOARD_GAME"
                description="The Sopra Steria Cybersecurity boardgame is, in its very essence, a reskin of the Agile Maturity board game. I got to add some twists to it."
            />
            <DoubleImage
                images={[
                    { src: `${assetPath}CasetteWire.png`, alt: 'Wireframe render for Sopra Steria project' },
                    { src: `${assetPath}CassetteRoom.png`, alt: 'Final render for Sopra Steria project' },
                ]}
            />
        </>
    );
}
