-- Reviews: let readers delete their own review.
-- The existing unique (ebook_id, user_id) constraint already limits every
-- reader to one review per book.

drop policy if exists "reviews self delete" on public.reviews;
create policy "reviews self delete" on public.reviews for delete to authenticated
  using ((select auth.uid()) = user_id);

grant delete on public.reviews to authenticated;

notify pgrst, 'reload schema';
