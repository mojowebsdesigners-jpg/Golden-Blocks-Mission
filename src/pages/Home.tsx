import { Seo } from '@/components/common/Seo'
import { SectionRail } from '@/components/layout/SectionRail'
import { HeroSection } from '@/sections/home/HeroSection'
import { WelcomeSection } from '@/sections/home/WelcomeSection'
import { PurposeSection } from '@/sections/home/PurposeSection'
import { MeaningSection } from '@/sections/home/MeaningSection'
import { MissionAreasSection } from '@/sections/home/MissionAreasSection'
import { FeaturedProjectsSection } from '@/sections/home/FeaturedProjectsSection'
import { GivingSection } from '@/sections/home/GivingSection'
import { PartnershipSDA } from '@/sections/common/PartnershipSDA'
import { FinalCTA } from '@/sections/common/FinalCTA'
import { SITE } from '@/data/site'

const RAIL = [
  { id: 'calling', label: 'The calling' },
  { id: 'welcome', label: 'Welcome' },
  { id: 'purpose', label: 'Purpose' },
  { id: 'meaning', label: 'The name' },
  { id: 'areas', label: 'Mission areas' },
  { id: 'projects', label: 'Projects' },
  { id: 'giving', label: 'Giving' },
  { id: 'partnership', label: 'Partnership' },
]

export default function Home() {
  return (
    <>
      <Seo title={SITE.name} path="/" />
      <SectionRail sections={RAIL} />
      <HeroSection />
      <WelcomeSection />
      <PurposeSection />
      <MeaningSection />
      <MissionAreasSection />
      <FeaturedProjectsSection />
      <GivingSection />
      <PartnershipSDA />
      <FinalCTA />
    </>
  )
}
