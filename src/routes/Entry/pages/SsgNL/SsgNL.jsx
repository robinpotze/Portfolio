import DashLine from '@components/decoration/DashLine';
import WorkHeader from '@components/ui/WorkHeader/WorkHeader';

const assetPath = '/img/work/ssgnl/';

export const Data = {
    id: 3,
    title: "SSGNL",
    synopsis: "The world is how we shape it.",
    description: "Sopra Steria is a European leader in digital transformation, providing one of the most comprehensive portfolios of end-to-end service offerings in the market: consulting, systems integration, software development, infrastructure management and business process services. I personally was a UX Designer, Full-Stack developer, and contributed to multiple games developed for Sopra Steria's internal innovation program. It explores themes of cyber security and corporate responsibility through strategic gameplay and immersive design.",
    client: "TRIPADVISORS",
    year: 2024,
    software: ["Illustrator","AfterEffects", "Blender", "Figma"],
    skills: ["Graphic Design", "Game Design", "3D Graphics", "Motion Graphics"],
    banner: `${assetPath}cybersec/CyberSec_Render.png`
}

export default function SsgNL() {
    return (
        <div>
            <div className='work-full-thin'>
                <img src={`${assetPath}Banner.png`} alt='An exploded overview of all the projects I made for Sopra Steria Benelux.' />
            </div>
            <WorkHeader
                title= "Auto|Q"
                subtitle="BRANDING:::MARKETING"
                description="I first started off in the Test Automation department of Sopra, where I quickly realized this was not a job for me. That doesn't mean I no longer wanted to work with them of course, as I became their marketing guy shortly after I swapped to JsRoots, the front-end devs."
            />

            <WorkHeader 
                title="CyberScurity"
                subtitle="EDUCATION:::BOARD_GAME"
                description="The Sopra Steria Cybersecurity boardgame is, in its very essence, a reskin of the Agile Maturity board game. I got to add some twists to it."
            />
            <div className='work-double'>
                <img src={`${assetPath}CasetteWire.png`} alt='Wireframe render for Sopra Steria project' />
                <DashLine direction="Vertical" />
                <img src={`${assetPath}CassetteRoom.png`} alt='Final render for Sopra Steria project' />
            </div>
        </div>
    );
}