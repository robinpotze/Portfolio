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
                { text: 'Designed multiple marketing campaigns and promotional materials.', icon: ArtIcon },
            ],
        },
        {
            name: 'PMOT',
            function: 'Brand & UX Designer',
            date: '2021-2022',
            details: [
                {
                    text: 'Designed a new webstore and introduced a mascot. Redesigned the logo, revamped brand colouring and adhered to industry standard UX practices',
                    icon: ArtIcon,
                },
                {
                    text: 'Introduced a learning platform in the same branding with a larger focus on industry standard designs in learning tools.',
                    icon: GatIcon,
                },
                { text: 'Created a link between the products and the learning materials to create a USP', icon: ArwIcon },
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
        { text: 'User Interface Design', icon: BllIcon, description: 'Designing intuitive and visually appealing user interfaces.' },
        { text: 'Brand Identity', icon: GatIcon, description: 'Creating and maintaining a consistent brand image across various platforms.' },
        { text: '3D Modeling', icon: ArwIcon, description: 'Building detailed and accurate 3D models for various applications.' },
        { text: 'Visual Effects', icon: ChkIcon, description: 'Designing and implementing visual effects for digital media.' },
        { text: 'Software Development', icon: BrcIcon, description: 'Developing software solutions with a focus on usability and performance.' },
    ],
    SFT: [
        { text: 'Illustrator', icon: '/assets/img/software/Illustrator.svg', description: 'Creating vector graphics and illustrations.' },
        { text: 'After Effects', icon: '/assets/img/software/AfterEffects.svg', description: 'Compositing and motion graphics for video projects.' },
        { text: 'Figma', icon: '/assets/img/software/Figma.svg', description: 'Designing user interfaces and prototypes collaboratively.' },
        { text: 'Blender', icon: '/assets/img/software/Blender.svg', description: '3D modeling, animation, and rendering.' },
        { text: 'Unity', icon: '/assets/img/software/Unity.svg', description: 'Developing interactive 3D content and games.' },
        { text: 'Unreal', icon: '/assets/img/software/Unreal.svg', description: 'Creating high-quality real-time 3D experiences.' },
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
