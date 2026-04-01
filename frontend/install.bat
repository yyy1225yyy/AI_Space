@echo off
cd /d H:\yyyflie\yyydemo\AI\AI_Space\frontend
rd /s /q node_modules 2>nul
del package-lock.json 2>nul
npm install 2>&1
