-- 事故：「保留のものだけ消そう」のつもりが、WHERE を付け忘れた。
delete from backup_demo.orders;
