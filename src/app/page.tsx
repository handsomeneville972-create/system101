import Image from "next/image";
import Link from "next/link";
import { Users, BookOpen, Lightbulb, AppWindow, GraduationCap } from "lucide-react";
import { DonateButton } from "@/components/DonateButton";

const features = [
  { icon: Users, title: "Find'em", desc: "Groups by craft. Apply. Vote. Belong." },
  { icon: BookOpen, title: "Ebooku", desc: "Upload books. Free or paid. Reviews." },
  { icon: Lightbulb, title: "Suggy", desc: "Group signals. Upvote. Ship." },
  { icon: AppWindow, title: "System Apps", desc: "Windows + Mac. Coming soon." },
  { icon: GraduationCap, title: "De-Course", desc: "Free courses. Video + notes." },
];

export default function Landing() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-20 text-center">
        <Image src="/logo.png" alt="0.01%SYSTEM" width={406} height={396} className="mx-auto h-16 w-auto" priority />
        <p className="mt-4 text-xs uppercase tracking-widest text-zinc-400">0.01%SYSTEM</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight">Grow.</h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          For those who aspire. Build something great. Find your people.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/auth/sign-up" className="btn-pill bg-white px-6 py-3 text-sm font-medium text-black">
            Start
          </Link>
          <Link href="/findem" className="btn-pill border hairline px-6 py-3 text-sm text-zinc-200">
            Explore
          </Link>
        </div>
        <div className="mt-6 flex justify-center">
          <DonateButton surface="home" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-6">
          <h2 className="text-lg font-medium">What we do</h2>
          <p className="mt-2 text-sm text-zinc-400">Small groups. High standards. Shared wins.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-medium">What you get</h2>
          <p className="mt-2 text-sm text-zinc-400">People like you. Books. Signals. Tools. Courses.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-medium">About us</h2>
          <p className="mt-2 text-sm text-zinc-400">For dreamers. Goal-oriented. Builders only.</p>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-5">
        {features.map((f) => (
          <div key={f.title} className="card p-5">
            <f.icon size={20} className="text-zinc-200" />
            <h3 className="mt-3 font-medium">{f.title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
