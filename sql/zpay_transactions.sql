-- Supabase 表：zpay_transactions
-- 用于存储 ZPAY 支付订单，支持一次性购买与订阅续费
-- 请在 Supabase SQL Editor 中以 postgres/service_role 身份执行

create table if not exists public.zpay_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  amount numeric(12,2) not null,
  payment_method text not null check (payment_method in ('alipay', 'wxpay')),
  out_trade_no text not null unique,
  trade_no text,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'refunded')),
  is_subscription boolean not null default false,
  subscription_period text check (subscription_period in ('monthly', 'yearly')),
  subscription_start timestamptz,
  subscription_end timestamptz,
  param text,
  metadata jsonb not null default '{}'::jsonb,
  notify_count int not null default 0,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.zpay_transactions is 'ZPAY 支付交易记录表';
comment on column public.zpay_transactions.out_trade_no is '商户侧唯一订单号';
comment on column public.zpay_transactions.trade_no is 'ZPAY 平台订单号';
comment on column public.zpay_transactions.status is 'pending=待支付, success=支付成功, failed=失败, refunded=已退款';
comment on column public.zpay_transactions.subscription_start is '订阅生效时间';
comment on column public.zpay_transactions.subscription_end is '订阅过期时间';
comment on column public.zpay_transactions.metadata is '业务扩展 JSON，如 product_name、subscription_period 等';
comment on column public.zpay_transactions.notify_count is '平台通知次数，用于去重与排查';

-- 常用查询索引
create index if not exists idx_zpay_transactions_user_id on public.zpay_transactions(user_id);
create index if not exists idx_zpay_transactions_status on public.zpay_transactions(status);
create index if not exists idx_zpay_transactions_product_id on public.zpay_transactions(product_id);
create index if not exists idx_zpay_transactions_subscription_end on public.zpay_transactions(subscription_end);

-- 启用 RLS：服务端使用 service_role 客户端可绕过 RLS；普通用户只允许查询自己的记录
alter table public.zpay_transactions enable row level security;

-- 允许登录用户查询自己的交易记录（支付成功页等前端展示需要）
-- PostgreSQL 的 CREATE POLICY 不支持 IF NOT EXISTS，先删除再重建以确保幂等
drop policy if exists "Users can read own zpay_transactions" on public.zpay_transactions;
create policy "Users can read own zpay_transactions"
  on public.zpay_transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 可选：自动更新时间戳（如果项目已有时戳触发器可忽略）
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_zpay_transactions_updated_at on public.zpay_transactions;
create trigger trg_zpay_transactions_updated_at
  before update on public.zpay_transactions
  for each row
  execute function public.update_updated_at_column();
