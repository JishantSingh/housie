import {Game} from './game/Game.js'
import sulla from 'sulla/dist/index.js'
import {CREATE_NEW_GAME, CREATING_NEW_GAME, WELCOME, BOT_USER_ID, BYE} from './constantsp/index.js'
import {format} from './util/index.js';

class App {
    static client;
    static groupsMap = new Map();
    static gameMap = new Map();
    static hostMap = new Map();

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
        await App.client.sendText(chatId, format(WELCOME,[senderName]));
        await App.client.sendText(chatId, CREATING_NEW_GAME);

        let game = await Game.createGame(BOT_USER_ID, senderId, App.client);
        console.log(game);
        await App.client.sendText(chatId, format(BYE,[senderName]));
    }

    static privateChatListener(client) {
        client.onMessage(message => {
            switch (message.body) {
                case CREATE_NEW_GAME:
                    App.createNewGame(message)
                default:
                    console.log(message.body)
            }
        })
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