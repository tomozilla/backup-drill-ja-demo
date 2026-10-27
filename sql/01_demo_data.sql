-- Demo data for the backup / restore drill. Fake orders only, in its own schema.
create schema if not exists backup_demo;
create table if not exists backup_demo.orders (
  id         bigint generated always as identity primary key,
  customer   text not null,
  item       text not null,
  amount_usd numeric(8,2) not null,
  status     text not null default 'paid',
  created_at timestamptz not null default now()
);
alter table backup_demo.orders enable row level security;   -- no policy: API roles can't read it

truncate backup_demo.orders restart identity;
insert into backup_demo.orders (customer, item, amount_usd, status) values
  ('Acme Demo',    'Starter kit',   49.00, 'paid'),
  ('Globex Demo',  'Annual plan',  480.00, 'paid'),
  ('Initech Demo', 'Support hours', 150.00, 'paid'),
  ('Umbrella Demo','Workshop',     300.00, 'pending'),
  ('Hooli Demo',   'Add-on pack',   25.00, 'paid');
