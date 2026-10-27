-- How many rows, how much money? Run before the accident, after it, and after the restore.
select count(*) as orders, coalesce(sum(amount_usd), 0) as total_usd from backup_demo.orders;
