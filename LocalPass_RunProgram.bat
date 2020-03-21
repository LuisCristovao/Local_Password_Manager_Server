copy DB.txt DB_tmp.txt
git fetch 
git pull
copy DB_tmp.txt DB.txt
del /f DB_tmp.txt
start node server.js
start "" http://localhost
REM pause