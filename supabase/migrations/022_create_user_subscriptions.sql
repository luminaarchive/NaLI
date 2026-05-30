-- Sprint 12E: user_subscriptions table for Sapling / Forest Keeper plans
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('sapling', 'forest_keeper')),
  order_id text UNIQUE,
  status text DEFAULT 'active',
  activated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
