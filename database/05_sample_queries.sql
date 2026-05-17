SELECT COUNT(*) AS total_products, SUM(CASE WHEN stock_qty = 0 THEN 1 ELSE 0 END) AS unavailable_products, ROUND(AVG(price), 2) AS average_price FROM mfs_products WHERE status = 'ACTIVE';
SELECT c.category_name, COUNT(p.product_id) AS products_count, ROUND(AVG(p.price), 2) AS average_price FROM mfs_categories c LEFT JOIN mfs_products p ON p.category_id = c.category_id AND p.status = 'ACTIVE' GROUP BY c.category_name ORDER BY products_count DESC;
SELECT p.product_name, mfs_pkg.product_avg_rating(p.product_id) AS average_rating, mfs_pkg.product_feedback_count(p.product_id) AS feedbacks_count FROM mfs_products p WHERE p.status = 'ACTIVE' ORDER BY average_rating DESC, feedbacks_count DESC;
SELECT * FROM mfs_audit_log ORDER BY changed_at DESC;
