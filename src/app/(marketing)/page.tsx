import { getUser } from "@/lib/auth";
import { Hero } from "@/components/landing/Hero";
import { TickerTape } from "@/components/landing/TickerTape";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { Protocol } from "@/components/landing/Protocol";
import { StatsStrip } from "@/components/landing/StatsStrip";
import { InterestMarquee } from "@/components/landing/InterestMarquee";
import { FinalCTA } from "@/components/landing/FinalCTA";

export const instant = false;

export default async function Landing() {
  const user = await getUser();
  const signedIn = Boolean(user);

  return (
    <>
      <Hero signedIn={signedIn} />
      <TickerTape />
      <FeatureGrid />
      <Protocol />
      <StatsStrip />
      <InterestMarquee />
      <FinalCTA signedIn={signedIn} />
    </>
  );
}
