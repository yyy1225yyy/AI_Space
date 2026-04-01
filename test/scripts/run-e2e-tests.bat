@echo off
chcp 65001 >nul
echo ================================
echo   AI广场 E2E 浏览器测试
echo ================================
echo.

REM 检查前端是否运行
echo [1/4] 检查前端服务...
curl -s -o nul -w "%%{http_code}" http://localhost:5173 >nul 2>nul
if %errorlevel% neq 0 (
    echo [警告] 前端服务未启动！尝试自动启动...
    start "Frontend Dev Server" cmd /c "cd ..\frontend && npm run dev"
    echo 等待前端服务启动...
    timeout /t 10 /nobreak >nul
)

REM 检查后端是否运行
echo [2/4] 检查后端服务...
curl -s -o nul -w "%%{http_code}" http://localhost:8080/api/job-roles >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 后端服务未启动！请先启动 Spring Boot 后端 (端口 8080)
    pause
    exit /b 1
)
echo [OK] 后端服务运行中

REM 安装依赖
echo.
echo [3/4] 检查测试依赖...
if not exist "node_modules" (
    echo 安装依赖中...
    npm install
)
if not exist "node_modules\@playwright" (
    echo 安装 Playwright 浏览器...
    npx playwright install chromium
)

REM 运行 E2E 测试
echo.
echo [4/4] 运行 E2E 浏览器测试...
echo ----------------------------
npm run test:e2e

echo.
echo ================================
echo   E2E 测试完成
echo ================================
pause
