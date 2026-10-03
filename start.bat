@echo off
echo Starting Motorbike Researcher Setup...
echo.

echo Installing Server Dependencies...
cd server
call npm install

echo Starting Backend Server in a new window...
start cmd /k "title Backend Server && npm start"
cd ..

echo.
echo Installing Client Dependencies...
cd client
call npm install

echo Starting Frontend Server in a new window...
start cmd /k "title Frontend Server && npm run dev"
cd ..

echo.
echo Setup Complete! The backend and frontend are starting in separate windows.
pause
