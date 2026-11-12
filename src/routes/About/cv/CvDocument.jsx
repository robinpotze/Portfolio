import { Document, Font, Link, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import { getCvContent } from './cvContent';

// ============================================
// The CV as a PDF, laid out in code from the site's own data.
// Loaded only when someone presses "Download CV".
// ============================================

const FONTS = '/assets/fonts/';

Font.register({ family: 'Orbitron', src: `${FONTS}Orbitron/static/Orbitron-Bold.ttf`, fontWeight: 700 });
Font.register({
    family: 'Kode Mono',
    fonts: [
        { src: `${FONTS}Kode_Mono/static/KodeMono-Regular.ttf`, fontWeight: 400 },
        { src: `${FONTS}Kode_Mono/static/KodeMono-Medium.ttf`, fontWeight: 500 },
    ],
});
// Keep words whole: the default hyphenation splits names and tool names
Font.registerHyphenationCallback((word) => [word]);

const A4_HEIGHT = 841.89;
const INK = '#0a0a0a';
const MUTED = '#555555';
const ACCENT = '#2ad0d5';
const ACCENT_INK = '#0b7c80';

const s = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 48,
        paddingHorizontal: 44,
        fontFamily: 'Helvetica',
        fontSize: 9.5,
        lineHeight: 1.4,
        color: INK,
    },
    name: { fontFamily: 'Orbitron', fontWeight: 700, fontSize: 22, lineHeight: 1.2 },
    roleLine: { marginTop: 4, fontSize: 11, lineHeight: 1.4, color: INK },
    contact: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, fontFamily: 'Kode Mono', fontSize: 8 },
    contactItem: { color: ACCENT_INK, textDecoration: 'none', marginRight: 12 },
    rule: { height: 2, backgroundColor: ACCENT, marginTop: 12, width: 64 },
    section: { marginTop: 18 },
    heading: {
        fontFamily: 'Orbitron',
        fontWeight: 700,
        fontSize: 8.5,
        lineHeight: 1.4,
        paddingBottom: 4,
        marginBottom: 8,
        borderBottomWidth: 0.75,
        borderBottomColor: ACCENT,
    },
    entry: { marginBottom: 10 },
    entryHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    entryTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10.5, lineHeight: 1.4 },
    entryOrg: { fontFamily: 'Helvetica', color: MUTED },
    date: { fontFamily: 'Kode Mono', fontSize: 8, color: MUTED },
    bullet: { flexDirection: 'row', marginTop: 2 },
    bulletMark: { width: 10, color: ACCENT_INK },
    bulletText: { flex: 1 },
    workTitle: { fontFamily: 'Kode Mono', fontWeight: 500, fontSize: 9.5, color: INK, textDecoration: 'none' },
    workSub: { fontFamily: 'Helvetica', fontSize: 9.5, color: MUTED },
    workMeta: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
    row: { flexDirection: 'row', marginTop: 2 },
    label: { width: 46, paddingTop: 1.5, fontFamily: 'Kode Mono', fontSize: 7, color: ACCENT_INK },
    rowText: { flex: 1 },
    workLink: { fontFamily: 'Kode Mono', fontSize: 7.5, color: ACCENT_INK, textDecoration: 'none' },
    columns: { flexDirection: 'row', gap: 24 },
    column: { flex: 1 },
    // Placed from the top: react-pdf misplaces bottom-anchored page numbers
    footer: {
        position: 'absolute',
        top: A4_HEIGHT - 30,
        left: 44,
        fontFamily: 'Kode Mono',
        fontSize: 7,
        lineHeight: 1,
        color: MUTED,
    },
    pageNumber: { right: 44, textAlign: 'right' },
});

function Section({ title, children }) {
    return (
        <View style={s.section}>
            <Text style={s.heading} minPresenceAhead={40}>
                {title}
            </Text>
            {children}
        </View>
    );
}

function Row({ label, children }) {
    return (
        <View style={s.row}>
            <Text style={s.label}>{label}</Text>
            <Text style={s.rowText}>{children}</Text>
        </View>
    );
}

export function CvDocument({ content, generatedOn }) {
    return (
        <Document
            title={`${content.name} — CV`}
            author={content.name}
            subject={content.roleLine}
            keywords={[...content.skills, ...content.tools].join(', ')}
            creator={content.site}
            producer={content.site}
        >
            <Page size="A4" style={s.page}>
                <Text style={s.name}>{content.name.toUpperCase()}</Text>
                <Text style={s.roleLine}>{content.roleLine}</Text>
                <View style={s.contact}>
                    {content.contact.map((item) => (
                        <Link key={item.link} src={item.link} style={s.contactItem}>
                            {item.label}
                        </Link>
                    ))}
                </View>
                <View style={s.rule} />

                <Section title="PROFILE">
                    <Text>{content.bio}</Text>
                </Section>

                <Section title="EXPERIENCE">
                    {content.experience.map((job) => (
                        <View key={job.company + job.date} style={s.entry} wrap={false}>
                            <View style={s.entryHead}>
                                <Text style={s.entryTitle}>
                                    {job.role}
                                    <Text style={s.entryOrg}>{`  ·  ${job.company}`}</Text>
                                </Text>
                                <Text style={s.date}>{job.date}</Text>
                            </View>
                            {job.details.map((detail) => (
                                <View key={detail} style={s.bullet}>
                                    <Text style={s.bulletMark}>–</Text>
                                    <Text style={s.bulletText}>{detail}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </Section>

                <View style={s.columns} wrap={false}>
                    <View style={s.column}>
                        <Section title="SKILLS">
                            <Text>{content.skills.join(', ')}</Text>
                        </Section>
                    </View>
                    <View style={s.column}>
                        <Section title="TOOLS">
                            <Text>{content.tools.join(', ')}</Text>
                        </Section>
                    </View>
                </View>

                <Section title="EDUCATION">
                    {content.education.map((entry) => (
                        <View key={entry.school + entry.date} style={s.entryHead} wrap={false}>
                            <Text style={s.entryTitle}>
                                {entry.course}
                                <Text style={s.entryOrg}>{`  ·  ${entry.school}`}</Text>
                            </Text>
                            <Text style={s.date}>{entry.date}</Text>
                        </View>
                    ))}
                </Section>

                {/* Page 2: the work, so page 1 reads as a standard CV */}
                <View break>
                    <Section title="SELECTED WORK">
                        {content.work.map((project) => (
                            <View key={project.key} style={s.entry} wrap={false}>
                                <View style={s.entryHead}>
                                    <Link src={project.url} style={s.workTitle}>
                                        {project.title}
                                        {project.subtitle && <Text style={s.workSub}>{`  ·  ${project.subtitle}`}</Text>}
                                    </Link>
                                    <View style={s.workMeta}>
                                        <Link src={project.url} style={s.workLink}>
                                            {project.url.replace(/^https?:\/\//, '')}
                                        </Link>
                                        <Text style={s.date}>{project.year}</Text>
                                    </View>
                                </View>
                                {project.summary && (
                                    <>
                                        <Row label="PROJECT">{project.summary.project}</Row>
                                        <Row label="ROLE">{project.summary.role}</Row>
                                        <Row label="RESULT">{project.summary.result}</Row>
                                    </>
                                )}
                            </View>
                        ))}
                    </Section>
                </View>

                <Text style={s.footer} fixed>{`GENERATED FROM ${content.site.toUpperCase()} · ${generatedOn}`}</Text>
                <Text style={[s.footer, s.pageNumber]} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
            </Page>
        </Document>
    );
}

/** Builds the CV from the current site data and returns it as a PDF blob. */
export function renderCvBlob() {
    const generatedOn = new Date().toISOString().slice(0, 10);
    return pdf(<CvDocument content={getCvContent()} generatedOn={generatedOn} />).toBlob();
}
