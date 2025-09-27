# 超级管理员设置指南

## 概述

本系统采用简化的权限控制模型，只有**一个指定的超级管理员**可以访问多账户管理功能，其他所有用户都是普通用户。

## 设置超级管理员

### 步骤1：获取用户ID

1. 首先让目标用户注册并登录系统
2. 在浏览器开发者工具的Console中运行以下代码获取用户ID：

```javascript
// 在登录后的页面控制台中执行
const { data: { user } } = await supabase.auth.getUser()
console.log('User ID:', user.id)
```

或者在Supabase仪表板中查看Authentication页面，找到对应用户的User UID。

### 步骤2：更新数据库函数

在Supabase SQL Editor中执行以下SQL，将 `YOUR_ACTUAL_USER_ID_HERE` 替换为步骤1获取的真实用户ID：

```sql
-- 更新超级管理员配置函数
CREATE OR REPLACE FUNCTION get_super_admin_id()
RETURNS UUID AS $$
BEGIN
    -- 替换为你的超级管理员用户ID
    RETURN 'YOUR_ACTUAL_USER_ID_HERE'::UUID;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 步骤3：更新前端配置

编辑 `src/composables/usePermissions.ts` 文件，找到以下行：

```typescript
const SUPER_ADMIN_ID = 'YOUR_SUPER_ADMIN_USER_ID_HERE'
```

将 `YOUR_SUPER_ADMIN_USER_ID_HERE` 替换为相同的用户ID。

### 步骤4：应用数据库更改

确保在Supabase SQL Editor中执行完整的 `database_schema.sql` 文件，以应用所有RLS策略和表结构更改。

## 验证设置

设置完成后，可以通过以下方式验证：

1. 使用超级管理员账户登录系统
2. 检查导航菜单中是否显示"多账户管理"选项及"超级管理员"标识
3. 尝试访问 `/account-management` 页面
4. 使用普通用户账户登录，确认无法看到多账户管理选项

## 权限功能

### 超级管理员可以：
- ✅ 查看和管理所有用户的账户
- ✅ 查看和管理所有用户的API配置
- ✅ 访问多账户管理页面
- ✅ 查看系统用户总览（通过 `super_admin_user_overview` 视图）

### 普通用户可以：
- ✅ 管理自己的API配置
- ✅ 管理自己的交易策略
- ❌ 无法访问多账户管理
- ❌ 无法查看其他用户的数据

## 安全注意事项

1. **保密性**：超级管理员用户ID应当保密，不要在前端代码中暴露
2. **备份**：建议记录超级管理员的用户ID，以防需要恢复访问
3. **单一性**：系统设计为只支持一个超级管理员，如需更换，需要更新数据库函数和前端代码
4. **RLS保护**：所有敏感数据都通过Row Level Security策略保护，确保数据安全

## 故障排除

### 无法访问多账户管理
- 确认用户ID设置正确
- 检查数据库函数是否已更新
- 确认前端代码中的用户ID匹配
- 验证RLS策略是否正确应用

### 权限检查失败
- 检查浏览器控制台是否有错误信息
- 确认Supabase连接正常
- 验证用户已正确登录

### 更改超级管理员
如需更改超级管理员，重复上述步骤1-3，使用新的用户ID。

## 技术架构

本权限系统基于：
- **数据库层**：PostgreSQL RLS策略 + 自定义函数
- **应用层**：Vue.js Composable + 响应式权限检查
- **认证层**：Supabase Auth + JWT令牌

系统确保了前后端双重权限验证，提供了强大的安全保障。
