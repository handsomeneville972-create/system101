import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · 0.01%SYSTEM",
  description: "What 0.01%SYSTEM collects, why, and how to get it back or deleted.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "Who we are",
    body: [
      "0.01%SYSTEM is a project of C. Levi Company. This policy explains what we collect when you use the service, why we collect it, and the choices you have.",
    ],
  },
  {
    heading: "What we collect",
    body: [
      "Account and sign-in: your email address. We send a magic sign-in link instead of storing a password.",
      "Profile: the display name, profession, bio and goals you enter, plus an avatar image if you upload one.",
      "Community activity: the groups you join, join requests you send or receive, votes you cast (including any reason you leave for a no vote), signal up and down votes, and the invite links created inside your groups.",
      "Content: books you upload or buy, the descriptions and prices you set, reviews and ratings you write, and courses you upload or watch.",
      "Payments: for paid books and donations we keep the transaction reference, amount, status and the email used, processed by Paystack.",
      "Waitlist: if you ask to be notified about the desktop apps, we store your email and which list you joined.",
      "Downloads: we issue time-limited signed links to files, and we log that a download was issued.",
      "Technical: server logs such as IP address, browser and timestamps, kept for security and reliability.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "To run the service: accounts, groups, votes, uploads, downloads and payments.",
      "To send you the messages the service owes you: sign-in links and, if you asked for them, launch notifications. We do not send marketing email.",
      "To keep the community safe: investigating reports, fraud and abuse.",
      "To understand what works, in aggregate only.",
    ],
  },
  {
    heading: "Who else sees it",
    body: [
      "Supabase provides sign-in, the database and file storage. Files are private and served through signed links.",
      "Paystack processes payments. Card details never touch our servers.",
      "Our hosting provider serves the site and its static assets.",
      "YouTube and Vimeo host course videos. Loading a course or notes page contacts them, so they see your request like any other site you visit.",
      "We do not sell data, and we do not share it with advertisers.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can edit your profile and avatar at any time from Settings.",
      "You can ask us to delete your account and data. We will delete your profile, groups, content and uploads. Records we must keep for legal or tax reasons, such as payment records, are retained for as long as the law requires.",
      "You can ask what we hold about you, or correct anything inaccurate, by emailing us.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "We use one essential cookie family: the session cookie that keeps you signed in. We do not run advertising trackers, and we do not build profiles across other websites.",
    ],
  },
  {
    heading: "Changes and contact",
    body: [
      "We will update this page when the policy changes and revise the date below.",
      "Questions, requests or complaints: support@001system.dev",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Privacy</h1>
      <p className="mt-2 text-sm text-zinc-400">Last updated: 22 October 2026</p>

      <div className="mt-6 space-y-4">
        {SECTIONS.map((s) => (
          <section key={s.heading} className="card p-6">
            <h2 className="text-sm font-medium">{s.heading}</h2>
            <div className="mt-3 space-y-2">
              {s.body.map((p) => (
                <p key={p} className="text-sm text-zinc-400">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-xs text-zinc-400">
        0.01%SYSTEM · From C. Levi Company
      </p>
    </div>
  );
}
