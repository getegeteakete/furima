-- =============================================================
-- フリマライブ  出店料の振込先情報  (0010_chat_settings_fee_payout.sql)
-- =============================================================
-- 元仕様: 出店料 1,200円（銀行振込 / PayPay）を出店者が運営へ支払う。
-- これまで「金額・支払い方式の選択 + 申告」までは実装済みだったが、
-- 出店者が実際にどこへ振り込めばよいかの「振込先」を表示していなかった。
-- 運営の受取先（銀行口座 / PayPay ID）を chat_settings シングルトンに保持し、
-- 出店者の支払い申告パネルに表示する。
--
-- ⚠️ 商品代金は引き続き運営が持たない（出店者⇔購入者の直接取引）。
--    本テーブルが保持するのは「出店料(¥1,200)の運営受取先」のみ。
-- 冪等（add column if not exists）。
-- =============================================================

alter table public.chat_settings
  add column if not exists fee_bank_info  text default '',
  add column if not exists fee_paypay_id  text default '';

-- 既存のシングルトン行(id=1)にも空文字を補完（null 回避）。
update public.chat_settings
  set fee_bank_info = coalesce(fee_bank_info, ''),
      fee_paypay_id = coalesce(fee_paypay_id, '')
  where id = 1;
