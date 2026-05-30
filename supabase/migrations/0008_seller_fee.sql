-- =============================================================
-- フリマライブ  出店料の支払い状態  (0008_seller_fee.sql)
-- =============================================================
-- 元仕様: 出店料 1,200円（銀行振込 / PayPay）を出店者が運営へ支払う。
-- 出店者が支払いを「申告」し、運営が「入金確認」する двухステップ。
--   unpaid     … 未申告
--   submitted  … 出店者が支払い申告（method を選択）
--   paid       … 運営が入金確認済み
-- 商品代金の決済は引き続き運営が持たない（出店者⇔購入者の直接取引）。冪等。
-- =============================================================

alter table public.seller_applications
  add column if not exists fee_status text not null default 'unpaid'
    check (fee_status in ('unpaid','submitted','paid')),
  add column if not exists fee_method text
    check (fee_method is null or fee_method in ('bank','paypay')),
  add column if not exists fee_submitted_at timestamptz,
  add column if not exists fee_paid_at timestamptz;
