-- 何件で、合計いくら？ 事故の前・事故のあと・復元のあとに実行する。
select count(*) as orders, coalesce(sum(amount_usd), 0) as total_usd from backup_demo.orders;
