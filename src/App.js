import {Game} from "./game/Game.js";
import sulla from "sulla/dist/index.js";
import {
    CREATE_NEW_GAME,
    CREATING_NEW_GAME,
    WELCOME,
    BOT_USER_ID,
    BYE,
    SEND_GAME_ID,
    UNIQUE_GAME_PER_USER_CONSTRAINT,
    JOIN_GAME,
    INVALID_GAME_ID,
    GROUP_IDS,
    ADD_REMOVE_PARTICIPANT_KNOWN_ERROR,
    ALL_GROUPS_FULL
} from "./constantsp/index.js";
import {format} from "./util/index.js";

export default class App {
    static client;
    static freeGroups = [];
    static groupIdToGameMap = new Map();
    static gameIdToGameMap = new Map();
    static hostIdToGameMap = new Map();
    static playerIdToGameMap = new Map();
    static groupIdToFreeMap = new Map();
    static callBacksForChat = [App.primaryRouter]; //This will contain all unctions for
    static main() {
        GROUP_IDS.forEach((i) => {
            App.groupIdToFreeMap.set(i, 1);
        }); //set all groups to free
        sulla.create("web_session")
            .then(async client => {
                App.client = client;
                return App.initiateGroups(client)
            })
            .then(groups => App.freeGroups = groups)
            .then(async () => App.privateChatListener(App.client));
        return 0;
    }

    /**
     *
     * @param client: Whatsapp client
     * @returns {Promise<Chat[]>}: list of refreshed groupIds
     */
    static async initiateGroups(client) {
        async function cleanGroup(groupId) {
            await client.clearChat(groupId)
            await client.getGroupMembersIds(groupId)
                .then(members => members.forEach(async member => {
                    if (member._serialized !== BOT_USER_ID) {
                        client.removeParticipant(groupId, member._serialized)
                            .catch(e => console.log(ADD_REMOVE_PARTICIPANT_KNOWN_ERROR))
                    }
                }))
            return groupId
        }

        let newGroups = await client.getAllGroups()
            .then(
                groups => groups
                    .map(group => group.id._serialized)
                    .map(async groupId => await cleanGroup(groupId)))
        return Promise.all(newGroups)
    }


    static async createNewGame(message) {
        const senderId = message.from;
        const chatId = message.chatId;
        const senderName = message.sender.pushname;
        //Issue 3 : here once the senderName came undefined not sure how
        //Although it was not reproduced
        if (App.playerIdToGameMap.has(message.sender.id)) {
            await App.client.sendText(chatId,
                format(UNIQUE_GAME_PER_USER_CONSTRAINT, [App.playerIdToGameMap.get(message.sender.id).id]));
            return;
        }
        await App.client.sendText(chatId, format(WELCOME, [senderName]));
        await App.client.sendText(chatId, CREATING_NEW_GAME);
        let groupId = App.freeGroups.pop()
        if (groupId === undefined) {
            await App.client.sendText(
                chatId,
                ALL_GROUPS_FULL
            );
            return;
        }
        Game.createGame(senderId, App.client, groupId)
            .then(async game => {
                App.gameIdToGameMap.set(game.id, game);
                App.hostIdToGameMap.set(game.hostId, game);
                App.groupIdToGameMap.set(game.groupId, game);
                App.playerIdToGameMap.set(game.hostId, game);
                App.client.sendText(
                    chatId,
                    format(SEND_GAME_ID, [senderName, game.id])
                );
            })
            .catch(e => console.error(e))
        // await App.client.sendText(chatId, format(BYE, [senderName]));
    }

    static primaryRouter(message) {
        switch (message.body) {
            case CREATE_NEW_GAME:
                //need to avoid 2 guys getting the same game
                App.createNewGame(message);
                break;

            case JOIN_GAME:
                App.joinGame(message);
                break;

            default:
                console.log(message);
        }
    }

    static privateChatListener(client) {
        //Either we need to write the whole code of onMessage in one or we can create a array of callbacks
        client.onMessage((message) => App.callBacksForChat.forEach(f => f(message)));
    }

    static async timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    static async joinGame(message) {
        const senderId = message.from;
        const chatId = message.chatId;
        const senderName = message.sender.pushname;
        if (App.playerIdToGameMap.has(senderId)) {
            await App.client.sendText(chatId, UNIQUE_GAME_PER_USER_CONSTRAINT);
            return;
        }
        App.client.sendText(chatId, "Please paste the GameID");
        var gameId;

        //For now I'm wating 3s but ideally we should kee rerying until he enters
        await App.timeout(3000);
        await Promise.all([
            App.client.loadAndGetAllMessagesInChat(chatId).then((chats) => {
                console.log(chats[chats.length - 1].body);
                gameId = parseInt(chats[chats.length - 1].body);
                console.log(gameId);
            }),
        ]);
        //TODO : Here we should retry sometime

        // let gameId = await App.client.onMessage((message1) =>
        //   parseInt(message1.body)
        // );

        console.log(App.gameIdToGameMap);
        if (!App.gameIdToGameMap.has(gameId)) {
            await App.client.sendText(chatId, INVALID_GAME_ID, message.id.toString());
            return;
        }
        let game = App.gameIdToGameMap.get(gameId);
        console.log(senderId);
        game.addParticipant(senderId);
    }
}

App.main();
// .then(app => app.createNewGame("380938304370@c.us", ["918847586471@c.us"]))
// .then((game) => gm = game)
// .then(() => console.log(gm))
// .then(() => gm.mkGroup())
// .then((x) => console.log("1. -> " + x))
// .then(() => console.log("2. ->  " + gm.groupId))
// .then(() => gm.addParticipants("917318019101@c.us"))
// .then(() => gm.addParticipants([""]))
