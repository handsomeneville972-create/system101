import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabasePublic } from "@/lib/supabase-public";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";

export type PriceFilter = "all" | "free" | "paid";

export type EbookListItem = {
  id: string;
  title: string;
  description: string | null;
  price_cents: number;
  currency: string;
  tags: string[] | null;
  cover_url: string | null;
  created_at: string;
  author: string | null;
  rating_avg: number | null;
  rating_count: number;
};

export type EbookReview = {
  id: string;
  rating: number;
  body: string | null;
  verified_purchase: boolean;
  created_at: string;
  user_id: string;
  author: string | null;
};

export type EbookDetail = EbookListItem & {
  author_bio: string | null;
  uploader_id: string | null;
  owned: boolean;
  is_uploader: boolean;
  reviews: EbookReview[];
  my_review: EbookReview | null;
};

type ProfileJoin = { display_name: string | null } | { display_name: string | null }[] | null;

function nameOf(p: ProfileJoin): string | null {
  const v = Array.isArray(p) ? p[0] : p;
  return v?.display_name ?? null;
}

async function signCovers(paths: (string | null)[]): Promise<Record<string, string>> {
  const uniq = Array.from(new Set(paths.filter((p): p is string => !!p)));
  if (uniq.length === 0) return {};
  const admin = supabaseAdmin();
  const { data } = await admin.storage.from("ebook-covers").createSignedUrls(uniq, 3600);
  const map: Record<string, string> = {};
  (data ?? []).forEach((d) => {
    if (d.signedUrl && d.path) map[d.path] = d.signedUrl;
  });
  return map;
}

function ratingOf(reviews: { rating: number }[] | null): { avg: number | null; count: number } {
  const list = reviews ?? [];
  if (list.length === 0) return { avg: null, count: 0 };
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  return { avg: Math.round((sum / list.length) * 10) / 10, count: list.length };
}

export async function listEbooks(filter: PriceFilter = "all", limit = 60): Promise<EbookListItem[]> {
  const sb = supabasePublic();
  let q = sb
    .from("ebooks")
    .select(
      "id,title,description,price_cents,currency,tags,cover_path,created_at,uploader_id,profiles(display_name),reviews(rating)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (filter === "free") q = q.eq("price_cents", 0);
  if (filter === "paid") q = q.gt("price_cents", 0);

  const { data } = await q;
  const rows = (data ?? []) as Record<string, unknown>[];
  const covers = await signCovers(rows.map((r) => (r.cover_path as string | null) ?? null));

  return rows.map((r) => {
    const { avg, count } = ratingOf((r.reviews as { rating: number }[] | null) ?? null);
    const coverPath = (r.cover_path as string | null) ?? null;
    return {
      id: r.id as string,
      title: r.title as string,
      description: (r.description as string | null) ?? null,
      price_cents: r.price_cents as number,
      currency: (r.currency as string) ?? "USD",
      tags: (r.tags as string[] | null) ?? null,
      cover_url: coverPath ? covers[coverPath] ?? null : null,
      created_at: r.created_at as string,
      author: nameOf(r.profiles as ProfileJoin),
      rating_avg: avg,
      rating_count: count,
    };
  });
}

export async function ebookDetail(id: string): Promise<EbookDetail | null> {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("ebooks")
    .select(
      "id,title,description,author_bio,price_cents,currency,tags,cover_path,file_path,uploader_id,status,created_at,profiles(display_name),reviews(id,rating,body,verified_purchase,created_at,user_id,profiles(display_name))"
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;
  const row = data as Record<string, unknown>;
  const user = await getUser();
  const isUploader = !!user && row.uploader_id === user.id;

  let owned = (row.price_cents as number) === 0;
  if (!owned && user) {
    const { data: pay } = await sb
      .from("payments")
      .select("id")
      .eq("ebook_id", id)
      .eq("buyer_id", user.id)
      .eq("status", "success")
      .maybeSingle();
    owned = !!pay;
  }

  const coverPath = (row.cover_path as string | null) ?? null;
  const covers = await signCovers([coverPath]);
  const { avg, count } = ratingOf((row.reviews as { rating: number }[] | null) ?? null);

  const reviews: EbookReview[] = ((row.reviews as Record<string, unknown>[] | null) ?? [])
    .map((rv) => ({
      id: rv.id as string,
      rating: rv.rating as number,
      body: (rv.body as string | null) ?? null,
      verified_purchase: !!rv.verified_purchase,
      created_at: rv.created_at as string,
      user_id: rv.user_id as string,
      author: nameOf(rv.profiles as ProfileJoin),
    }))
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    author_bio: (row.author_bio as string | null) ?? null,
    price_cents: row.price_cents as number,
    currency: (row.currency as string) ?? "USD",
    tags: (row.tags as string[] | null) ?? null,
    cover_url: coverPath ? covers[coverPath] ?? null : null,
    created_at: row.created_at as string,
    author: nameOf(row.profiles as ProfileJoin),
    rating_avg: avg,
    rating_count: count,
    uploader_id: (row.uploader_id as string | null) ?? null,
    owned,
    is_uploader: isUploader,
    reviews,
    my_review: user ? reviews.find((r) => r.user_id === user.id) ?? null : null,
  };
}

export async function recentEbooks(limit = 3): Promise<EbookListItem[]> {
  const list = await listEbooks("all", limit);
  return list.slice(0, limit);
}
