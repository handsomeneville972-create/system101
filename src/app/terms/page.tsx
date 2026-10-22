import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms · 0.01%SYSTEM",
  description: "The rules for using 0.01%SYSTEM: accounts, community voting, uploads, payments and donations.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "Acceptance",
    body: [
      "By using 0.01%SYSTEM you agree to these terms. If you do not agree, do not use the service. We may update these terms; continuing to use the service after a change means you accept the revised version.",
    ],
  },
  {
    heading: "Accounts",
    body: [
      "You need an account to post, vote, upload or buy. We use magic sign-in links, so you never set a password. Keep your email secure: anyone with your email can sign in to your account.",
      "You must be old enough to form a binding contract where you live, and at least 13 years old. One person, one account.",
    ],
  },
  {
    heading: "Community rules and voting",
    body: [
      "Groups are small and member-run. A signal or proposal passes when 80% of the cast votes are yes after the 48 hour voting window, or when every member has voted and the yes share reaches 80% before the window closes. The group leader breaks a tie.",
      "Members may record a reason with a no vote. We keep it so the decision has context, and you can see who dissented and why.",
      "Do not manipulate votes, brigade groups, or post content that is unlawful, deceptive, or aimed at harassment. Group leaders can remove members and content that breaks these rules.",
    ],
  },
  {
    heading: "Your content",
    body: [
      "You keep ownership of what you upload. You give us a licence to host, store, display and distribute it as part of the service, and to let buyers download it.",
      "You confirm you have the right to upload what you post, and that it does not infringe anyone else's rights.",
      "We can remove content that breaks these terms or that we are required to remove by law.",
    ],
  },
  {
    heading: "Books, courses and payments",
    body: [
      "Paid books are sold in US dollars through Paystack. The minimum price for a paid book is $2.99. Downloads are served through private signed links that work once per purchase and expire.",
      "Author payouts run through Paystack subaccounts and splits, and the platform keeps a 10% share of each sale. Sellers are responsible for their own taxes and for refunds they approve.",
      "Donations are optional, processed by Paystack, and never required for any part of the service.",
      "Refunds for digital purchases are handled case by case. Email us with your Paystack reference and we will sort it out. Where a file has already been downloaded, we may decline a refund.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "Do not post malware, scrape or overload the service, attempt to access other people's accounts, or use the service to break the law.",
      "Do not misrepresent who you are or who authored something you post.",
    ],
  },
  {
    heading: "Third-party content",
    body: [
      "Courses embed videos hosted by YouTube and Vimeo. Those providers operate their own terms and privacy practices.",
    ],
  },
  {
    heading: "Disclaimers and liability",
    body: [
      "The service is provided as is. We do not guarantee it will be uninterrupted or that content on it is accurate, legal in your jurisdiction, or fit for a particular purpose.",
      "To the extent the law allows, our total liability to you for any claim is limited to the amount you paid us in the twelve months before the claim. Nothing here limits liability that cannot be limited by law.",
    ],
  },
  {
    heading: "Ending use",
    body: [
      "You can stop using the service at any time and ask us to delete your account. We may suspend or close an account that breaks these terms, that is used for fraud, or that puts the service or other members at risk.",
    ],
  },
  {
    heading: "Changes and contact",
    body: [
      "We will update this page when these terms change and revise the date below.",
      "Questions: support@001system.dev",
    ],
  },
];

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Terms</h1>
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
