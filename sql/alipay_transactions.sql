-- Supabase 表：alipay_transactions
-- 用于存储支付宝当面付（扫码支付）订单

create table if not exists public.alipay_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  amount numeric(12,2) not null,
  out_trade_no text not null unique,
  trade_no text,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'closed')),
  qr_code text,
  buyer_logon_id text,
  paid_at timestamptz,
  notify_count int not null default 0,
  is_subscription boolean not null default false,
  subscription_period text check (subscription_period in ('monthly', 'yearly')),
  subscription_start timestamptz,
  subscription_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.alipay_transactions is '支付宝当面付交易记录表';
comment on column public.alipay_transactions.out_trade_no is '商户侧唯一订单号';
comment on column public.alipay_transactions.trade_no is '支付宝交易号';
comment on column public.alipay_transactions.status is 'pending=待支付, success=支付成功, failed=失败, closed=已关闭';
comment on column public.alipay_transactions.qr_code is '支付宝返回的二维码链接（如 https://qr.alipay.com/...）';
comment on column public.alipay_transactions.buyer_logon_id is '买家支付宝账号';
comment on column public.alipay_transactions.metadata is '业务扩展 JSON';
comment on column public.alipay_transactions.notify_count is '异步通知次数';
comment on column public.alipay_transactions.is_subscription is '是否为订阅订单';
comment on column public.alipay_transactions.subscription_period is '订阅周期：monthly=月付，yearly=年付';
comment on column public.alipay_transactions.subscription_start is '订阅生效时间';
comment on column public.alipay_transactions.subscription_end is '订阅过期时间';

create index if not exists idx_alipay_transactions_user_id on public.alipay_transactions(user_id);
create index if not exists idx_alipay_transactions_status on public.alipay_transactions(status);
create index if not exists idx_alipay_transactions_out_trade_no on public.alipay_transactions(out_trade_no);
create index if not exists idx_alipay_transactions_trade_no on public.alipay_transactions(trade_no);

-- 启用 RLS：服务端使用 service_role 绕过；前端仅允许查看自己的记录
alter table public.alipay_transactions enable row level security;

drop policy if exists "Users can read own alipay_transactions" on public.alipay_transactions;
create policy "Users can read own alipay_transactions"
  on public.alipay_transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 自动更新时间戳
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_alipay_transactions_updated_at on public.alipay_transactions;
create trigger trg_alipay_transactions_updated_at
  before update on public.alipay_transactions
  for each row
  execute function public.update_updated_at_column();

-- 兼容已存在的老表：追加订阅相关字段（不会影响已有数据）
alter table public.alipay_transactions add column if not exists is_subscription boolean not null default false;
alter table public.alipay_transactions add column if not exists subscription_period text check (subscription_period in ('monthly', 'yearly'));
alter table public.alipay_transactions add column if not exists subscription_start timestamptz;
alter table public.alipay_transactions add column if not exists subscription_end timestamptz;

create index if not exists idx_alipay_transactions_subscription_end on public.alipay_transactions(subscription_end);

comment on column public.alipay_transactions.is_subscription is '是否为订阅订单';
comment on column public.alipay_transactions.subscription_period is '订阅周期：monthly=月付，yearly=年付';
comment on column public.alipay_transactions.subscription_start is '订阅生效时间';
comment on column public.alipay_transactions.subscription_end is '订阅过期时间';
