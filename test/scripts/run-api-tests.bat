@echo off
chcp 65001 >nul
echo ================================
echo   AI广场 API 接口测试
echo ================================
echo.

REM 检查后端是否运行
echo [1/3] 检查后端服务...
curl -s -o nul -w "%%{http_code}" http://localhost:8080/api/job-roles >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 后端服务未启动！请先启动 Spring Boot 后端 (端口 8080)
    echo 运行命令: cd backend ^&^& mvn spring-boot:run
    pause
    exit /b 1
)
echo [OK] 后端服务运行中

REM 安装依赖
echo.
echo [2/3] 检查测试依赖...
if not exist "node_modules" (
    echo 安装依赖中...
    npm install
)

REM 运行 API 测试
echo.
echo [3/3] 运行 API 接口测试...
echo ----------------------------
npm run test:api -- --reporter=verbose

echo.
echo ================================
echo   测试完成
echo ================================
pause
