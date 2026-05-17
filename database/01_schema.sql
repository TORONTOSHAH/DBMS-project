CREATE TABLE mfs_roles (role_id NUMBER PRIMARY KEY, role_code VARCHAR2(20) NOT NULL UNIQUE, role_name VARCHAR2(80) NOT NULL);
CREATE TABLE mfs_users (user_id NUMBER PRIMARY KEY, role_id NUMBER NOT NULL REFERENCES mfs_roles(role_id), full_name VARCHAR2(120) NOT NULL, email VARCHAR2(160) NOT NULL UNIQUE, password_hash VARCHAR2(128) NOT NULL, status VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL, created_at DATE DEFAULT SYSDATE NOT NULL, CONSTRAINT chk_mfs_users_status CHECK (status IN ('ACTIVE','BLOCKED','DELETED')));
CREATE TABLE mfs_categories (category_id NUMBER PRIMARY KEY, category_name VARCHAR2(100) NOT NULL UNIQUE, status VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL, CONSTRAINT chk_mfs_category_status CHECK (status IN ('ACTIVE','HIDDEN')));
CREATE TABLE mfs_products (product_id NUMBER PRIMARY KEY, seller_id NUMBER NOT NULL REFERENCES mfs_users(user_id), category_id NUMBER NOT NULL REFERENCES mfs_categories(category_id), product_name VARCHAR2(160) NOT NULL, description VARCHAR2(1000), price NUMBER(12,2) NOT NULL, stock_qty NUMBER DEFAULT 0 NOT NULL, status VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL, created_at DATE DEFAULT SYSDATE NOT NULL, updated_at DATE, CONSTRAINT chk_mfs_product_price CHECK (price > 0), CONSTRAINT chk_mfs_product_stock CHECK (stock_qty >= 0), CONSTRAINT chk_mfs_product_status CHECK (status IN ('ACTIVE','HIDDEN','DELETED')));
CREATE TABLE mfs_feedbacks (feedback_id NUMBER PRIMARY KEY, product_id NUMBER NOT NULL REFERENCES mfs_products(product_id), buyer_id NUMBER NOT NULL REFERENCES mfs_users(user_id), rating NUMBER(1) NOT NULL, message VARCHAR2(1500) NOT NULL, seller_reply VARCHAR2(1500), status VARCHAR2(20) DEFAULT 'VISIBLE' NOT NULL, created_at DATE DEFAULT SYSDATE NOT NULL, replied_at DATE, CONSTRAINT chk_mfs_feedback_rating CHECK (rating BETWEEN 1 AND 5), CONSTRAINT chk_mfs_feedback_status CHECK (status IN ('VISIBLE','HIDDEN','DELETED')));
CREATE TABLE mfs_notifications (notification_id NUMBER PRIMARY KEY, user_id NUMBER NOT NULL REFERENCES mfs_users(user_id), title VARCHAR2(160) NOT NULL, message VARCHAR2(1000) NOT NULL, is_read CHAR(1) DEFAULT 'N' NOT NULL, created_at DATE DEFAULT SYSDATE NOT NULL, CONSTRAINT chk_mfs_notification_read CHECK (is_read IN ('Y','N')));
CREATE TABLE mfs_audit_log (audit_id NUMBER PRIMARY KEY, table_name VARCHAR2(60) NOT NULL, record_id NUMBER NOT NULL, action_name VARCHAR2(20) NOT NULL, old_value VARCHAR2(2000), new_value VARCHAR2(2000), changed_by VARCHAR2(160) DEFAULT USER NOT NULL, changed_at DATE DEFAULT SYSDATE NOT NULL);
CREATE SEQUENCE seq_mfs_roles START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_mfs_users START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_mfs_categories START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_mfs_products START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_mfs_feedbacks START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_mfs_notifications START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_mfs_audit START WITH 1 INCREMENT BY 1;
CREATE OR REPLACE TRIGGER trg_mfs_roles_bi BEFORE INSERT ON mfs_roles FOR EACH ROW BEGIN IF :NEW.role_id IS NULL THEN :NEW.role_id := seq_mfs_roles.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_mfs_users_bi BEFORE INSERT ON mfs_users FOR EACH ROW BEGIN IF :NEW.user_id IS NULL THEN :NEW.user_id := seq_mfs_users.NEXTVAL; END IF; :NEW.email := LOWER(TRIM(:NEW.email)); END;
/
CREATE OR REPLACE TRIGGER trg_mfs_categories_bi BEFORE INSERT ON mfs_categories FOR EACH ROW BEGIN IF :NEW.category_id IS NULL THEN :NEW.category_id := seq_mfs_categories.NEXTVAL; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_mfs_products_biur BEFORE INSERT OR UPDATE ON mfs_products FOR EACH ROW BEGIN IF INSERTING AND :NEW.product_id IS NULL THEN :NEW.product_id := seq_mfs_products.NEXTVAL; END IF; :NEW.updated_at := SYSDATE; END;
/
CREATE OR REPLACE TRIGGER trg_mfs_feedbacks_biur BEFORE INSERT OR UPDATE ON mfs_feedbacks FOR EACH ROW BEGIN IF INSERTING AND :NEW.feedback_id IS NULL THEN :NEW.feedback_id := seq_mfs_feedbacks.NEXTVAL; END IF; IF UPDATING AND :OLD.seller_reply IS NULL AND :NEW.seller_reply IS NOT NULL THEN :NEW.replied_at := SYSDATE; END IF; END;
/
CREATE OR REPLACE TRIGGER trg_mfs_feedbacks_audit AFTER INSERT OR UPDATE OR DELETE ON mfs_feedbacks FOR EACH ROW BEGIN IF INSERTING THEN INSERT INTO mfs_audit_log(audit_id, table_name, record_id, action_name, new_value) VALUES(seq_mfs_audit.NEXTVAL, 'MFS_FEEDBACKS', :NEW.feedback_id, 'INSERT', :NEW.message); ELSIF UPDATING THEN INSERT INTO mfs_audit_log(audit_id, table_name, record_id, action_name, old_value, new_value) VALUES(seq_mfs_audit.NEXTVAL, 'MFS_FEEDBACKS', :NEW.feedback_id, 'UPDATE', :OLD.status || ':' || :OLD.seller_reply, :NEW.status || ':' || :NEW.seller_reply); ELSIF DELETING THEN INSERT INTO mfs_audit_log(audit_id, table_name, record_id, action_name, old_value) VALUES(seq_mfs_audit.NEXTVAL, 'MFS_FEEDBACKS', :OLD.feedback_id, 'DELETE', :OLD.message); END IF; END;
/
CREATE OR REPLACE TRIGGER trg_mfs_feedback_notify AFTER INSERT ON mfs_feedbacks FOR EACH ROW DECLARE v_seller_id mfs_products.seller_id%TYPE; BEGIN SELECT seller_id INTO v_seller_id FROM mfs_products WHERE product_id = :NEW.product_id; INSERT INTO mfs_notifications(notification_id, user_id, title, message) VALUES(seq_mfs_notifications.NEXTVAL, v_seller_id, 'New product feedback', 'A buyer left rating ' || :NEW.rating || ' for product #' || :NEW.product_id); END;
/
