-- Script to create a trigger that inserts a profiles row when a new auth.user is created
-- Run this in Supabase SQL Editor as the project owner

-- 0) Drop existing trigger/function if present (safe cleanup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 1) Ensure 'roles.name' is unique (create unique index if not present)
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_name_unique ON public.roles (name);

-- 2) Ensure a 'user' row exists in roles
INSERT INTO public.roles (name)
VALUES ('user')
ON CONFLICT (name) DO NOTHING;

-- 3) Create or replace function: create a profiles row when a new auth.user is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_json jsonb := to_jsonb(NEW);
  username_text text := NULL;
  avatar_text text := NULL;
BEGIN
  -- Safely extract username/avatar from possible metadata fields without directly
  -- referencing NEW.user_metadata (which may not exist in some Supabase schemas).
  username_text := NULLIF(new_json->'user_metadata'->> 'username', '');
  IF username_text IS NULL THEN
    username_text := NULLIF(new_json->'raw_user_meta_data'->> 'username', '');
  END IF;

  avatar_text := NULLIF(new_json->'user_metadata'->> 'avatar_url', '');
  IF avatar_text IS NULL THEN
    avatar_text := NULLIF(new_json->'raw_user_meta_data'->> 'avatar_url', '');
  END IF;

  -- Ensure username is NOT NULL (profiles.username is NOT NULL in your schema).
  -- Fallback order: found username metadata -> local-part of email -> generated fallback from id.
  IF username_text IS NULL THEN
    username_text := NULLIF(new_json->>'email', '');
    IF username_text IS NOT NULL THEN
      username_text := split_part(username_text, '@', 1);
    END IF;
  END IF;
  IF username_text IS NULL THEN
    -- final fallback: user_{first8chars_of_uuid}
    username_text := 'user_' || substring(NEW.id::text from 1 for 8);
  END IF;

  INSERT INTO public.profiles (id, username, avatar_url, role_id)
  VALUES (
    NEW.id,
    username_text,
    avatar_text,
    (SELECT id FROM public.roles WHERE name = 'user' LIMIT 1)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 4) Create the trigger: remove existing trigger then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
