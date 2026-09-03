import { AboutSection } from "@/components/AboutSection";
import { CasesSection } from "@/components/CasesSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { CertificatesSection } from "@/components/CertificatesSection";
import { ContactInfoSection } from "@/components/ContactInfoSection";
import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { InfoCards } from "@/components/InfoCards";
import { ServicesGrid } from "@/components/ServicesGrid";
import { SiteLayout } from "@/components/SiteLayout";
import { TeamSection } from "@/components/TeamSection";

export function PatientDemo() {
  return (
    <SiteLayout>
      <Hero />
      <InfoCards />
      <ServicesGrid />
      <AboutSection />
      <TeamSection />
      <CertificatesSection />
      <CasesSection />
      <ReviewsSection />
      <ContactSection />
      <ContactInfoSection />
    </SiteLayout>
  );
}
