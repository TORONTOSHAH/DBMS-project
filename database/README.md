# Management Feedback System Database

Run order:

0. 00_drop.sql optional, only when you want to reset an existing demo schema.
1. 01_schema.sql
2. 02_package_spec.sql
3. 03_package_body.sql
4. 04_seed.sql
5. 05_sample_queries.sql

Included database objects:
- Tables: roles, users, categories, products, feedbacks, notifications, audit log.
- Constraints: role/status/rating/price/stock validation.
- Sequences: all primary keys generated through sequences.
- Triggers: automatic IDs, audit logs, notifications.
- Package: mfs_pkg.
- Functions, procedures, analytics queries and collections.
