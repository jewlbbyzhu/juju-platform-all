#!/bin/bash
# 自动修复ESLint问题脚本

echo "🔧 JUJU App ESLint 自动修复脚本"
echo "================================"
echo ""

cd ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp

# 1. 修复未使用的变量（使用下划线前缀）
echo "1️⃣ 修复未使用的变量..."

# 修复VIPCenterScreen.tsx
sed -i '' 's/const \[loading, setLoading\]/const [_loading, setLoading]/g' src/screens/VIPCenterScreen.tsx
sed -i '' 's/catch (error)/catch (_error)/g' src/screens/VIPCenterScreen.tsx

# 修复VIPEventsScreen.tsx  
sed -i '' 's/const navigation = useNavigation/cconst _navigation = useNavigation/g' src/screens/VIPEventsScreen.tsx
sed -i '' 's/catch (error)/catch (_error)/g' src/screens/VIPEventsScreen.tsx

# 修复VIPLevelsScreen.tsx
sed -i '' "s/'TouchableOpacity',//g" src/screens/VIPLevelsScreen.tsx
sed -i '' 's/const navigation = useNavigation/cconst _navigation = useNavigation/g' src/screens/VIPLevelsScreen.tsx

# 修复VIPPointsScreen.tsx
sed -i '' 's/catch (error)/catch (_error)/g' src/screens/VIPPointsScreen.tsx

# 修复glassmorphism.ts
sed -i '' "s/, TextStyle//g" src/theme/glassmorphism.ts

echo "   ✅ 变量修复完成"

# 2. 再次运行ESLint自动修复
echo ""
echo "2️⃣ 再次运行ESLint自动修复..."
npx eslint src/ --ext .ts,.tsx --fix 2>&1 | tail -10

# 3. 检查剩余问题
echo ""
echo "3️⃣ 检查剩余问题..."
REMAINING=$(npx eslint src/ --ext .ts,.tsx 2>&1 | grep -c "error\|warning" || echo "0")
echo "   剩余问题: $REMAINING"

echo ""
echo "✅ 自动修复完成！"
