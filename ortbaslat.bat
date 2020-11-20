
title Bot Restart written by Orient#6666
@echo off
C:\Windows\System32\mode con cols=50 lines=6 >nul
set /a var=0
COLOR 0B
set EXE=Hello.exe    


:Start
title Orient Bot ( Simdiye kadarki restartlar %var% )
echo -------------------------------------------------
echo ------------- Yeniden Baslatiliyor ( %var% ) -------------
echo ---------------- Bot calistiriliyor -----------------
echo ---------------- Developement By Orient ----------------
echo -------------------------------------------------
set /a var+=1
start node index.js 
timeout /t 72000 >nul     
cls
goto Stop


:Stop
title Orient Bot ( Simdiye kadarki restartlar %var% )
echo -------------------------------------------------
echo ------------- Yeniden Baslatiliyor ( %var% ) -------------
echo ---------------- Bot calistiriliyor -----------------
echo ---------------- Developement By Orient ----------------
echo -------------------------------------------------
timeout /t 72000 >null
taskkill /f /im node.exe >nul
timeout /t 5 >null
cls
goto Start


