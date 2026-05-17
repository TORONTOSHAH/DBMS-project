CREATE OR REPLACE PACKAGE mfs_pkg AS
  TYPE t_id_list IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
  TYPE t_dashboard_stats IS RECORD (total_products NUMBER, total_feedbacks NUMBER, pending_replies NUMBER, average_rating NUMBER, unread_notifications NUMBER);
  FUNCTION authenticate_user(p_email IN VARCHAR2, p_password_hash IN VARCHAR2, p_role_code IN VARCHAR2) RETURN NUMBER;
  FUNCTION user_role(p_user_id IN NUMBER) RETURN VARCHAR2;
  FUNCTION product_avg_rating(p_product_id IN NUMBER) RETURN NUMBER;
  FUNCTION product_feedback_count(p_product_id IN NUMBER) RETURN NUMBER;
  FUNCTION seller_pending_replies(p_seller_id IN NUMBER) RETURN NUMBER;
  FUNCTION unread_notifications(p_user_id IN NUMBER) RETURN NUMBER;
  FUNCTION low_stock_products(p_threshold IN NUMBER DEFAULT 5) RETURN t_id_list;
  PROCEDURE create_user(p_role_code IN VARCHAR2, p_full_name IN VARCHAR2, p_email IN VARCHAR2, p_password_hash IN VARCHAR2, p_user_id OUT NUMBER);
  PROCEDURE add_product(p_seller_id IN NUMBER, p_category_id IN NUMBER, p_product_name IN VARCHAR2, p_description IN VARCHAR2, p_price IN NUMBER, p_stock_qty IN NUMBER, p_product_id OUT NUMBER);
  PROCEDURE submit_feedback(p_product_id IN NUMBER, p_buyer_id IN NUMBER, p_rating IN NUMBER, p_message IN VARCHAR2, p_feedback_id OUT NUMBER);
  PROCEDURE reply_feedback(p_seller_id IN NUMBER, p_feedback_id IN NUMBER, p_reply IN VARCHAR2);
  PROCEDURE delete_feedback(p_admin_id IN NUMBER, p_feedback_id IN NUMBER, p_reason IN VARCHAR2);
  PROCEDURE update_product_stock(p_seller_id IN NUMBER, p_product_id IN NUMBER, p_new_stock IN NUMBER);
  PROCEDURE mark_notification_read(p_user_id IN NUMBER, p_notification_id IN NUMBER);
  PROCEDURE dashboard_stats(p_user_id IN NUMBER, p_stats OUT t_dashboard_stats);
END mfs_pkg;
/
