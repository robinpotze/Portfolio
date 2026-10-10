import { LINKEDIN, SITE, SOCIALS } from '@config/site.config';
import { pagesData } from '@routes/Entry/pages/autogen';
import { sortItems } from '@utils/workUtils';
import { ABOUT_BIO, ABOUT_DATA } from '../about.data';

// Project data uses icon file names; the CV shows the product names
const TOOL_NAMES = { AfterEffects: 'After Effects' };

const toolName = (name) => TOOL_NAMES[name] || name;
const unique = (list) => [...new Set(list)];
const displayUrl = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
const dateRange = (date) => date.replace('-', '–');

/** Everything the CV shows, gathered from the same data the site renders. */
export function getCvContent() {
    const work = sortItems(pagesData).map(({ key, data }) => ({
        key,
        title: data.title,
        subtitle: data.subtitle,
        year: data.year,
        summary: data.summary,
        software: data.software || [],
        url: `${SITE.URL}/work/${key}`,
    }));

    return {
        name: SITE.NAME,
        roleLine: SITE.ROLE_LINE,
        bio: ABOUT_BIO,
        contact: [
            { label: SITE.EMAIL, link: `mailto:${SITE.EMAIL}` },
            { label: displayUrl(SITE.URL), link: SITE.URL },
            ...[LINKEDIN, ...SOCIALS.filter((social) => social !== LINKEDIN)].map((social) => ({
                label: displayUrl(social.link),
                link: social.link,
            })),
        ],
        experience: ABOUT_DATA.EXP.map((job) => ({
            company: job.name,
            role: job.function,
            date: dateRange(job.date),
            details: job.details.map((detail) => detail.text),
        })),
        work,
        skills: ABOUT_DATA.SKL.map((skill) => skill.text),
        tools: unique([...ABOUT_DATA.SFT.map((tool) => tool.text), ...work.flatMap((project) => project.software)].map(toolName)),
        education: ABOUT_DATA.EDU.map((entry) => ({
            school: entry.school,
            course: entry.course,
            date: dateRange(entry.date),
        })),
        site: displayUrl(SITE.URL),
    };
}
