-- 简单的用户管理解决方案
-- 创建自定义用户管理表，避免直接操作auth.users

-- 1. 创建用户管理表
CREATE TABLE IF NOT EXISTS user_management (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(50) DEFAULT 'user'
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_management_auth_user_id ON user_management(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_management_email ON user_management(email);

-- 3. 创建触发器，自动同步auth.users的变化
CREATE OR REPLACE FUNCTION sync_user_management()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO user_management (auth_user_id, email, role)
        VALUES (
            NEW.id, 
            NEW.email, 
            CASE 
                WHEN NEW.id = 'dd84eede-dbe2-4878-a037-7aeb299f14e6'::UUID 
                THEN 'admin' 
                ELSE 'user' 
            END
        )
        ON CONFLICT (email) DO UPDATE SET
            auth_user_id = NEW.id,
            updated_at = NOW();
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        UPDATE user_management 
        SET 
            email = NEW.email,
            updated_at = NOW()
        WHERE auth_user_id = NEW.id;
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        DELETE FROM user_management WHERE auth_user_id = OLD.id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建触发器
DROP TRIGGER IF EXISTS sync_auth_users ON auth.users;
CREATE TRIGGER sync_auth_users
    AFTER INSERT OR UPDATE OR DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_management();

-- 5. 启用RLS
ALTER TABLE user_management ENABLE ROW LEVEL SECURITY;

-- 6. 创建RLS策略（只有管理员可以查看所有用户）
CREATE POLICY "Admin can view all users" ON user_management
    FOR SELECT USING (
        auth.uid() = 'dd84eede-dbe2-4878-a037-7aeb299f14e6'::UUID
    );

CREATE POLICY "Admin can manage all users" ON user_management
    FOR ALL USING (
        auth.uid() = 'dd84eede-dbe2-4878-a037-7aeb299f14e6'::UUID
    );

-- 7. 手动同步现有用户（一次性执行）
INSERT INTO user_management (auth_user_id, email, role)
SELECT 
    id, 
    email, 
    CASE 
        WHEN id = 'dd84eede-dbe2-4878-a037-7aeb299f14e6'::UUID 
        THEN 'admin' 
        ELSE 'user' 
    END as role
FROM auth.users
ON CONFLICT (email) DO UPDATE SET
    auth_user_id = EXCLUDED.auth_user_id,
    updated_at = NOW();
