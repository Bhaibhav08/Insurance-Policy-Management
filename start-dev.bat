@echo off
echo Starting Insurance Management System...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:4200
echo.
echo Press any key to exit...
pause > nul

