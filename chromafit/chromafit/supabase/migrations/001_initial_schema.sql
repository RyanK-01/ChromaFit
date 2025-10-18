-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- Create profiles table
create table profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_photo_url text,
  body_metrics jsonb,
  smpl_params jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create garments table
create table garments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null check (category in ('t-shirt', 'jeans', 'dress', 'shirt', 'pants', 'shorts', 'jacket', 'sweater', 'skirt', 'shoes', 'accessories')),
  image_url text not null,
  measurements jsonb,
  clip_embedding vector(768),
  source_type text not null check (source_type in ('upload', 'url')),
  source_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tryons table
create table tryons (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  garment_id uuid references garments(id) on delete cascade not null,
  result_image_url text,
  fit_score real check (fit_score >= 0 and fit_score <= 1),
  fit_explanation jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create outfits table
create table outfits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  garment_ids jsonb not null,
  outfit_embedding vector(768),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create storage buckets
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('garments', 'garments', true);
insert into storage.buckets (id, name, public) values ('tryons', 'tryons', true);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table garments enable row level security;
alter table tryons enable row level security;
alter table outfits enable row level security;

-- RLS Policies for profiles
create policy "Users can view all profiles" on profiles
  for select using (true);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = user_id);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = user_id);

-- RLS Policies for garments
create policy "Users can view all garments" on garments
  for select using (true);

create policy "Users can insert their own garments" on garments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own garments" on garments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own garments" on garments
  for delete using (auth.uid() = user_id);

-- RLS Policies for tryons
create policy "Users can view all tryons" on tryons
  for select using (true);

create policy "Users can insert their own tryons" on tryons
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tryons" on tryons
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tryons" on tryons
  for delete using (auth.uid() = user_id);

-- RLS Policies for outfits
create policy "Users can view all outfits" on outfits
  for select using (true);

create policy "Users can insert their own outfits" on outfits
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own outfits" on outfits
  for update using (auth.uid() = user_id);

create policy "Users can delete their own outfits" on outfits
  for delete using (auth.uid() = user_id);

-- Storage policies
create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Users can upload their own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Garment images are publicly accessible" on storage.objects
  for select using (bucket_id = 'garments');

create policy "Users can upload their own garments" on storage.objects
  for insert with check (bucket_id = 'garments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own garments" on storage.objects
  for update using (bucket_id = 'garments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own garments" on storage.objects
  for delete using (bucket_id = 'garments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Try-on images are publicly accessible" on storage.objects
  for select using (bucket_id = 'tryons');

create policy "Users can upload their own try-ons" on storage.objects
  for insert with check (bucket_id = 'tryons' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own try-ons" on storage.objects
  for update using (bucket_id = 'tryons' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own try-ons" on storage.objects
  for delete using (bucket_id = 'tryons' and auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for better performance
create index idx_garments_user_id on garments(user_id);
create index idx_garments_category on garments(category);
create index idx_tryons_user_id on tryons(user_id);
create index idx_tryons_garment_id on tryons(garment_id);
create index idx_outfits_user_id on outfits(user_id);

-- Create function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
