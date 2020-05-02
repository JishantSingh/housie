import {Game} from './game/Game.js'
import sulla from 'sulla/dist/index.js'
import {
    CREATE_NEW_GAME,
    CREATING_NEW_GAME,
    WELCOME,
    BOT_USER_ID,
    BYE,
    SEND_GAME_ID,
    UNIQUE_GAME_PER_USER_CONSTRAINT,
    JOIN_GAME,
    INVALID_GAME_ID
} from './constantsp/index.js'
import {format} from './util/index.js';

export default class App {
    static client;
    static groupIdToGameMap = new Map();
    static gameIdToGameMap = new Map();
    static hostIdToGameMap = new Map();
    static playerToGameMap = new Map();

    static main() {
        return sulla.create("web_session").then((client) => {
            App.client = client;
            App.privateChatListener(client)
            // App.createNewGame("380938304370@c.us", ["918847586471@c.us"])
            // App.runApp("")
        });
    }

    static async createNewGame(message) {
        const senderId = message.from;
        const chatId = message.chatId;
        const senderName = message.sender.pushname;
        if (App.hostIdToGameMap.has(message.from)) {
            await App.client.sendText(chatId, UNIQUE_GAME_PER_USER_CONSTRAINT)
            return;
        }
        await App.client.sendText(chatId, format(WELCOME, [senderName]));
        await App.client.sendText(chatId, CREATING_NEW_GAME);

        let game = await Game.createGame(BOT_USER_ID, senderId, App.client);
        console.log(game);


        await App.client.sendText(chatId, format(SEND_GAME_ID, [senderName, game.id]))
        await App.client.sendText(chatId, format(BYE, [senderName]));
    }


    static privateChatListener(client) {
        client.onMessage(message => {
            switch (message.body) {
                case CREATE_NEW_GAME:
                    App.createNewGame(message)
                    break
                case JOIN_GAME:
                    App.joinGame(message)
                    break
                default:
                    console.log(message.body)
            }
        })
    }

    static async joinGame(message) {
        const senderId = message.from;
        const chatId = message.chatId;
        const senderName = message.sender.pushname;
        if (App.playerToGameMap.has(senderId)){
            await App.client.sendText(chatId, UNIQUE_GAME_PER_USER_CONSTRAINT)
            return;
        }
        let gameId = await App.client.onMessage(message1 => parseInt(message1.body))
        if(!App.gameIdToGameMap.has(gameId)){
            await App.client.reply(chatId, INVALID_GAME_ID, message.id.toString())
            return;
        }
        let game = App.gameIdToGameMap.get(gameId)
        game.addParticipant(senderId)
    }
}

App.main()
// .then(app => app.createNewGame("380938304370@c.us", ["918847586471@c.us"]))
// .then((game) => gm = game)
// .then(() => console.log(gm))
// .then(() => gm.mkGroup())
// .then((x) => console.log("1. -> " + x))
// .then(() => console.log("2. ->  " + gm.groupId))
// .then(() => gm.addParticipants("917318019101@c.us"))
// .then(() => gm.addParticipants([""]))