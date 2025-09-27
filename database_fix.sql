-- 修复用户创建问题的SQL脚本

-- 1. 删除现有的触发器函数
DROP FUNCTION IF EXISTS sync_user_management() CASCADE;

-- 2. 重新创建改进的触发器函数
CREATE OR REPLACE FUNCTION sync_user_management()
RETURNS TRIGGER 
SECURITY DEFINER -- 以函数定义者权限运行，绕过RLS
SET search_path = public
AS $$
BEGIN
    -- 处理用户插入
    IF TG_OP = 'INSERT' THEN
        -- 使用UPSERT避免冲突
        INSERT INTO public.user_management (auth_user_id, email, role, is_active)
        VALUES (
            NEW.id,
            NEW.email,
            CASE 
                WHEN NEW.id::TEXT = 'dd84eede-dbe2-4878-a037-7aeb299f14e6' 
                THEN 'admin'::TEXT
                ELSE 'user'::TEXT
            END,
            true
        )
        ON CONFLICT (email) 
        DO UPDATE SET
            auth_user_id = EXCLUDED.auth_user_id,
            is_active = EXCLUDED.is_active,
            updated_at = NOW();
        
        RETURN NEW;
    END IF;
    
    -- 处理用户更新
    IF TG_OP = 'UPDATE' THEN
        UPDATE public.user_management 
        SET 
            email = NEW.email,
            updated_at = NOW()
        WHERE auth_user_id = NEW.id;
        
        RETURN NEW;
    END IF;
    
    -- 处理用户删除
    IF TG_OP = 'DELETE' THEN
        DELETE FROM public.user_management 
        WHERE auth_user_id = OLD.id;
        
        RETURN OLD;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 3. 重新创建触发器
DROP TRIGGER IF EXISTS sync_auth_users ON auth.users;
CREATE TRIGGER sync_auth_users
    AFTER INSERT OR UPDATE OR DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_management();

-- 4. 更新RLS策略，确保触发器能正常工作
DROP POLICY IF EXISTS "Admin can view all users" ON user_management;
DROP POLICY IF EXISTS "Admin can manage all users" ON user_management;

-- 创建更精确的RLS策略
CREATE POLICY "Admin can view all users" ON user_management
    FOR SELECT 
    USING (auth.uid()::TEXT = 'dd84eede-dbe2-4878-a037-7aeb299f14e6');

CREATE POLICY "Admin can insert users" ON user_management
    FOR INSERT 
    WITH CHECK (auth.uid()::TEXT = 'dd84eede-dbe2-4878-a037-7aeb299f14e6');

CREATE POLICY "Admin can update users" ON user_management
    FOR UPDATE 
    USING (auth.uid()::TEXT = 'dd84eede-dbe2-4878-a037-7aeb299f14e6')
    WITH CHECK (auth.uid()::TEXT = 'dd84eede-dbe2-4878-a037-7aeb299f14e6');

CREATE POLICY "Admin can delete users" ON user_management
    FOR DELETE 
    USING (auth.uid()::TEXT = 'dd84eede-dbe2-4878-a037-7aeb299f14e6');

-- 5. 手动同步现有用户（清理后重新同步）
TRUNCATE TABLE user_management;

INSERT INTO user_management (auth_user_id, email, role, is_active)
SELECT 
    id,
    email,
    CASE 
        WHEN id::TEXT = 'dd84eede-dbe2-4878-a037-7aeb299f14e6' 
        THEN 'admin'::TEXT
        ELSE 'user'::TEXT
    END as role,
    true as is_active
FROM auth.users
ON CONFLICT (email) DO UPDATE SET
    auth_user_id = EXCLUDED.auth_user_id,
    role = EXCLUDED.role,
    updated_at = NOW();
