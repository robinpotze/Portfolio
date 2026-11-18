import ArtIcon from '@/assets/icons/ART.svg?react';
import ArwIcon from '@/assets/icons/ARW.svg?react';
import BllIcon from '@/assets/icons/BLL.svg?react';
import BrcIcon from '@/assets/icons/BRC.svg?react';
import ChkIcon from '@/assets/icons/CHK.svg?react';
import CrsIcon from '@/assets/icons/CRS.svg?react';
import DceIcon from '@/assets/icons/DCE.svg?react';
import GatIcon from '@/assets/icons/GAT.svg?react';
import MrkIcon from '@/assets/icons/MRK.svg?react';

export const ABOUT_INTRO = {
    name: 'Robin Potze',
    role: 'DIGITAL ARTIST / CREATIVE DEVELOPER',
    bio: 'Digital artist and creative developer working between UX, brand identity and 3D. I design and build interactive work, from games to web experiences, with a background in game design.',
};

export const ABOUT_SECTIONS = [
    { key: 'EXP', number: '01', title: 'Work experience', metadata: 'ROLES / EMPLOYERS / DATES' },
    { key: 'SKL', number: '02', title: 'Skills', metadata: 'CAPABILITIES / METHODS' },
    { key: 'SFT', number: '03', title: 'Software', metadata: 'TOOLS / WORKFLOWS' },
    { key: 'EDU', number: '04', title: 'Education', metadata: 'DEGREES / SCHOOLS / DATES' },
];

export const ABOUT_DATA = {
    EXP: [
        {
            name: 'Sopra Steria',
            function: 'UX Designer',
            date: '2022-NOW',
            details: [
                { text: 'Designed and developed serious games in both digital and physical formats.', icon: DceIcon },
                { text: 'Designed and developed UX for various clients in the public services sector.', icon: BrcIcon },
                { text: 'Worked on secondment at CJIB as test automation engineer, then UX designer.', icon: ChkIcon },
                { text: 'Designed multiple marketing campaigns and promotional materials.', icon: ArtIcon },
            ],
        },
        {
            name: 'PMOT',
            function: 'Brand & UX Designer',
            date: '2021-2022',
            details: [
                {
                    text: 'Designed a new webstore with a robot mascot, redesigned the logo and brand colours, and applied standard e-commerce UX patterns.',
                    icon: ArtIcon,
                },
                {
                    text: 'Designed a learning platform in the same branding, where teachers share lessons linked to products.',
                    icon: GatIcon,
                },
                { text: 'Linked products to the lessons and manuals that use them, through tags and metadata.', icon: ArwIcon },
            ],
        },
        {
            name: 'Vixel',
            function: 'Creative Developer',
            date: '2020-2021',
            details: [
                { text: 'Concepted and developed new User Avatars to fit gender, size and VR engineering environments.', icon: MrkIcon },
                { text: 'Concepted and developed 3D assets for tools to be used in the ArchViz VR software.', icon: CrsIcon },
                { text: 'Ran end-user usability tests with the created assets and iterated on the feedback throughout the process.', icon: ChkIcon },
            ],
        },
    ],
    SKL: [
        { text: 'User Interface Design', icon: BllIcon, description: 'Interfaces for games and web projects, including Monster DB, PMOT and CJIB.' },
        { text: 'Brand Identity', icon: GatIcon, description: 'Identities and promotional material, mostly for Sopra Steria.' },
        { text: '3D Modeling', icon: ArwIcon, description: 'Environments and props for my games, and the PMOT mascot.' },
        { text: 'Visual Effects', icon: ChkIcon, description: 'Shaders and effects for my game projects.' },
        { text: 'Software Development', icon: BrcIcon, description: 'Front-end development at CJIB and on Monster DB.' },
    ],
    SFT: [
        { text: 'Illustrator', icon: '/assets/img/software/Illustrator.svg', description: 'Graphic design, and sometimes UI design.' },
        { text: 'After Effects', icon: '/assets/img/software/AfterEffects.svg', description: 'Motion design, and video for in-game screens.' },
        { text: 'Figma', icon: '/assets/img/software/Figma.svg', description: 'UI, UX and graphic design.' },
        { text: 'Blender', icon: '/assets/img/software/Blender.svg', description: 'Everything 3D: modelling, materials, animation and rendering.' },
        { text: 'Unity', icon: '/assets/img/software/Unity.svg', description: 'Game development, including my game jam entries.' },
        { text: 'Unreal', icon: '/assets/img/software/Unreal.svg', description: 'Passion projects and complex VFX for video.' },
        { text: 'React', icon: '/assets/img/software/React.svg', description: 'Front end of Monster DB.' },
        { text: 'Angular', icon: '/assets/img/software/Angular.svg', description: 'Front-end work at CJIB and for a current Sopra Steria client.' },
        { text: 'FL Studio', description: 'Sound design and music, including the DDD sound effects.' },
    ],
    EDU: [
        {
            school: 'Hanze',
            icon: GatIcon,
            course: 'Communication & Multimedia Design - Game Design, Bsc.',
            date: '2017-2022',
        },
    ],
};
