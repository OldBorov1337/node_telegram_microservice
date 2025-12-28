чтобы запусить проект надо выполнить следущее: 

git clone https://github.com/OldBorov1337/node_telegram_microservice 


установка библиотек:
npm i express dotenv pouchdb nanoid
npm i -D nodemon

создать файл .env в корне проекта с такими параметрами

port=3020
tg_token=8264250793:AAGQ_vFqsS6e_bt9mN7Cf9QXR9yYQpPpE0s
poll_ms=2000
pouch_path=./data/usersdb
tg_admin= сюда написать свой id, его можно получить зайдя на бота @userinfobot

бота можно найти по @node_task_git_bot


создать нового пользователя можно такой командой в консоли 
node src/cli/newUserByConcole.js --id=111 --name="Console User" --username=console_user --platform=desktop --spec="created from console"

создание нового пользователя через бота:
надо зайти на бота 
@node_task_git_bot
запустить сервис:
npm run dev
и после этого в боте будут доступны такие команды 
/start - создвет/обновляет пользователя
/me - показывает данные пользователя 
/setplatform <desktop|web|ios|android|unknown> - устанавливает платформу например /setplatform ios 
/setspec <text> - устанавливает specdata для текущего пользователя например /setspec trex
/delete - ставит статус deleted пользователю (сделал мягкое удаление)

Теперь команды которые доступны только админу, то-есть если заполнено поле tg_admin= в .env 
/ban <UserId> - банит пользователя по id например /ban 1223455 (ставит статус  "status": "blocked")
/unban <UserId> - ставит пользователю status = active работает так-же /unban 32325343
/tag add <UserId> <tag> - добавляет тэг пользователю наример /tag add 325342424 boss (может быть много тэгов)
/tag rm <UserId> <tag> - удаляет тэг например /tag rm 34424242 boss


спасибо за внимание! <3


