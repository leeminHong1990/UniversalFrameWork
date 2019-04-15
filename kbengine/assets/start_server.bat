@echo off
set curpath=%~dp0

cd ..
set KBE_ROOT=%cd%
set KBE_RES_PATH=%KBE_ROOT%/kbe_1.17/res/;%curpath%/;%curpath%/scripts/;%curpath%/res/
set KBE_BIN_PATH=%KBE_ROOT%/kbe_1.17/bin/server/

if defined uid (echo UID = %uid%) else set uid=%random%%%32760+1

cd %curpath%
call "kill_server.bat"

echo KBE_ROOT = %KBE_ROOT%
echo KBE_RES_PATH = %KBE_RES_PATH%
echo KBE_BIN_PATH = %KBE_BIN_PATH%

start %KBE_BIN_PATH%/machine.exe --cid=18055 --gus=1
start %KBE_BIN_PATH%/logger.exe --cid=28055 --gus=2
start %KBE_BIN_PATH%/interfaces.exe --cid=38055 --gus=3
start %KBE_BIN_PATH%/dbmgr.exe --cid=48055 --gus=4
start %KBE_BIN_PATH%/baseappmgr.exe --cid=58055 --gus=5
start %KBE_BIN_PATH%/cellappmgr.exe --cid=68055 --gus=6
start %KBE_BIN_PATH%/baseapp.exe --cid=78055 --gus=7
@rem start %KBE_BIN_PATH%/baseapp.exe --cid=78055 --gus=8 --hide=1
start %KBE_BIN_PATH%/cellapp.exe --cid=88055 --gus=9
@rem start %KBE_BIN_PATH%/cellapp.exe --cid=88055  --gus=10 --hide=1
start %KBE_BIN_PATH%/loginapp.exe --cid=98055 --gus=11