-- MAQSAD API permissions. Run after 0001 and 0002 migrations.
-- RLS policies continue to restrict each user's rows.
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.goals,
  public.learning_paths,
  public.daily_tasks,
  public.focus_sessions,
  public.pomodoro_sessions,
  public.lesson_progress,
  public.reading_progress,
  public.user_achievements,
  public.user_statistics,
  public.notifications,
  public.user_settings
to authenticated;

grant select on table
  public.courses,
  public.lessons,
  public.books,
  public.achievements
to anon, authenticated;
