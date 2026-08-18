import Hero from '@/landing/Hero';
import AboutSection from '@/landing/AboutSection';
import ContactUsLanding from '@/landing/ContactUsLanding';
import TeamSection from '@/landing/TeamSection';
export default function Home() {
    return (
        <>
            <Hero />
            <AboutSection/>
            <ContactUsLanding/>
            <TeamSection/>
        </>
    );
}
