@echo off
chcp 65001 >nul
echo ================================
echo   AI广场 前端组件测试
echo ================================
echo.

REM 安装依赖
echo [1/2] 检查测试依赖...
if not exist "node_modules" (
    echo 安装依赖中...
    npm install
)

REM 运行前端测试
echo.
echo [2/2] 运行前端组件测试...
echo ----------------------------
npm run test:frontend -- --reporter=verbose

echo.
echo ================================
echo   前端测试完成
echo ================================
pause
