SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict atPMcq5NmmCX10OgnM7D1OB3AeaCzgqvSxNg1ghz77GUHdO3no3ARLSMVmtHEvT

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: orders; Type: TABLE DATA; Schema: backup_demo; Owner: postgres
--

INSERT INTO "backup_demo"."orders" ("id", "customer", "item", "amount_usd", "status", "created_at") OVERRIDING SYSTEM VALUE VALUES
	(1, 'Acme Demo', 'Starter kit', 49.00, 'paid', '2026-10-27 07:40:23.626218+00'),
	(2, 'Globex Demo', 'Annual plan', 480.00, 'paid', '2026-10-27 07:40:23.626218+00'),
	(3, 'Initech Demo', 'Support hours', 150.00, 'paid', '2026-10-27 07:40:23.626218+00'),
	(4, 'Umbrella Demo', 'Workshop', 300.00, 'pending', '2026-10-27 07:40:23.626218+00'),
	(5, 'Hooli Demo', 'Add-on pack', 25.00, 'paid', '2026-10-27 07:40:23.626218+00');


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: backup_demo; Owner: postgres
--

SELECT pg_catalog.setval('"backup_demo"."orders_id_seq"', 5, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict atPMcq5NmmCX10OgnM7D1OB3AeaCzgqvSxNg1ghz77GUHdO3no3ARLSMVmtHEvT

RESET ALL;
