@echo off
echo ========================================
echo 部署 AI 心理学实验项目到服务器
echo ========================================
echo.

echo [1/4] 上传文件到服务器...
scp D:\MyClaudeProject\AI-\ai-experiment-final.tar.gz root@106.54.16.246:/root/

echo.
echo [2/4] 解压文件...
ssh root@106.54.16.246 "cd /root/ai-experiment && tar -xzf ../ai-experiment-final.tar.gz"

echo.
echo [3/4] 重启服务...
ssh root@106.54.16.246 "source ~/.bashrc && cd /root/ai-experiment && pm2 restart ai-experiment"

echo.
echo [4/4] 检查服务状态...
ssh root@106.54.16.246 "source ~/.bashrc && pm2 status"

echo.
echo ========================================
echo 部署完成！
echo 访问地址: http://106.54.16.246:3000
echo 后台管理: http://106.54.16.246:3000/admin.html
echo ========================================
pause
