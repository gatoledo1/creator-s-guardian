-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for message intent
CREATE TYPE public.message_intent AS ENUM ('partnership', 'fan', 'question', 'hate', 'spam');

-- Create enum for message priority
CREATE TYPE public.message_priority AS ENUM ('respond_now', 'can_wait', 'ignore');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  instagram_username TEXT,
  instagram_id TEXT,
  instagram_access_token TEXT,
  avatar_url TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  instagram_page_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  instagram_message_id TEXT UNIQUE,
  sender_instagram_id TEXT NOT NULL,
  sender_username TEXT,
  sender_name TEXT,
  sender_avatar_url TEXT,
  sender_followers_count INTEGER DEFAULT 0,
  content TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create classifications table
CREATE TABLE public.classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL UNIQUE,
  intent message_intent NOT NULL,
  priority message_priority NOT NULL,
  suggested_reply TEXT,
  confidence DECIMAL(3,2),
  classified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classifications ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for workspaces
CREATE POLICY "Users can view own workspaces" ON public.workspaces
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own workspaces" ON public.workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own workspaces" ON public.workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages from own workspaces" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = messages.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages from own workspaces" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = messages.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- RLS Policies for classifications
CREATE POLICY "Users can view classifications from own messages" ON public.classifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages
      JOIN public.workspaces ON workspaces.id = messages.workspace_id
      WHERE messages.id = classifications.message_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();