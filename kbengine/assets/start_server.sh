#!/bin/sh

export ASSETS_ROOT=$(pwd)
export KBE_ROOT=$(cd ../; pwd)
export KBE_RES_PATH="$KBE_ROOT/kbe/res/:$ASSETS_ROOT:$ASSETS_ROOT/res/:$ASSETS_ROOT/scripts/"
export KBE_BIN_PATH="$KBE_ROOT/kbe/bin/server/"

echo KBE_ROOT = \"${KBE_ROOT}\"
echo KBE_RES_PATH = \"${KBE_RES_PATH}\"
echo KBE_BIN_PATH = \"${KBE_BIN_PATH}\"

sh ./kill_server.sh

$KBE_BIN_PATH/machine --cid=2129652375332859701 --gus=1&
$KBE_BIN_PATH/logger --cid=1129653375331859701 --gus=2&
$KBE_BIN_PATH/interfaces --cid=1129652375332859701 --gus=3&
$KBE_BIN_PATH/dbmgr --cid=3129652375332859701 --gus=4&
$KBE_BIN_PATH/baseappmgr --cid=4129652375332859701 --gus=5&
$KBE_BIN_PATH/cellappmgr --cid=5129652375332859701 --gus=6&
$KBE_BIN_PATH/baseapp --cid=6129652375332859701 --gus=7&
$KBE_BIN_PATH/cellapp --cid=7129652375332859701 --gus=8&
$KBE_BIN_PATH/cellapp --cid=8129652375332859701 --gus=9&
$KBE_BIN_PATH/loginapp --cid=9129652375332859701 --gus=10&

