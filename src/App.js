import {Game, Participant} from "./game/index.js";
import sulla from "sulla/dist/index.js";
import {
    CREATE_NEW_GAME,
    CREATING_NEW_GAME,
    WELCOME,
    BOT_USER_ID,
    BYE,
    UNIQUE_GAME_PER_USER_CONSTRAINT,
    GROUP_IDS,
    MISSING_OPTIONAL_ARGUMENT,
    ALL_GROUPS_FULL,
    GAME_START_LOGGING,
    JOIN_GAME_MESSAGE_TO_HOST,
    REQUEST_HOST_TO_ADD_PARTICIPANTS,
    FAILED_CREATE_GAME_MESSAGE,
    FAILED_CREATE_GAME_LOG
} from "./constantsp/index.js";
import {format} from "./util/index.js";

export default class App {
    static client;
    static freeGroups = [];
    static groupIdToGameIdMap = new Map();
    static gameIdToGameMap = new Map();
    static hostIdToGameIdMap = new Map();
    static playerIdToGameIdMap = new Map();
    static callBacksForChat = [App.primaryRouter]; //This will contain all unctions for
    static main() {
        sulla.create("web_session")
            .then(async client => {
                App.client = client;
                return App.initiateGroups(client)
            })
            .then(groups => App.freeGroups = groups)
            .then(async () => App.privateChatListener(App.client));
        return 0;
    }

    static async cleanGroup(groupId) {
        await this.client.clearChat(groupId)
        await this.client.getGroupMembersIds(groupId)
            .then(members => members.forEach(async member => {
                if (member._serialized !== BOT_USER_ID) {
                    this.client.removeParticipant(groupId, member._serialized)
                        .catch(e => console.warn(MISSING_OPTIONAL_ARGUMENT))
                }
            }))
        return groupId
    }

    /**
     *
     * @param client: Whatsapp client
     * @returns {Promise<Chat[]>}: list of refreshed groupIds
     */
    static async initiateGroups(client) {

        let newGroups = await client.getAllGroups()
            .then(
                groups => groups
                    .map(group => group.id._serialized)
                    .map(async groupId => await App.cleanGroup(groupId)))
        return Promise.all(newGroups)
    }


    static async createNewGame(message) {
        let host = new Participant(message.sender.id)
        host.name = message.sender.pushname
        const chatId = message.chatId;
        //Issue 3 : here once the senderName came undefined not sure how
        //Although it was not reproduced
        if (App.playerIdToGameIdMap.has(host.id)) {
            await App.client.sendText(host.chatId,
                format(UNIQUE_GAME_PER_USER_CONSTRAINT, [App.playerIdToGameIdMap.get(host.id)]));
            return;
        }
        await App.client.sendText(host.chatId, format(WELCOME, [host.name]));
        await App.client.sendText(host.chatId, CREATING_NEW_GAME);
        let groupId = App.freeGroups.pop()
        if (groupId === undefined) {
            await App.client.sendText(
                host.chatId,
                ALL_GROUPS_FULL
            );
            return;
        }
        return Game.createGame(host, App.client, groupId)
            .then(async game => {
                if (game !== undefined) {
                    App.gameIdToGameMap.set(game.id, game);
                    App.hostIdToGameIdMap.set(game.host.id, game.id);
                    App.groupIdToGameIdMap.set(game.groupId, game.id);
                    App.playerIdToGameIdMap.set(game.host.id, game.id);
                    App.client.sendText(chatId, JOIN_GAME_MESSAGE_TO_HOST)
                        .then(() => App.client.sendText(groupId, REQUEST_HOST_TO_ADD_PARTICIPANTS))
                    return Promise.resolve(game.groupId)
                } else {
                    await this.cleanGroup(groupId)
                    await App.client.sendText(host.id, FAILED_CREATE_GAME_MESSAGE)
                    return undefined
                }
            })
            .catch(e => console.error(e))
    }

    static primaryRouter(message) {
        switch (message.body.toLowerCase()) {
            case CREATE_NEW_GAME:
                //need to avoid 2 guys getting the same game
                App.createNewGame(message)
                    .then(id => {
                            if (id !== undefined) console.info(GAME_START_LOGGING, id)
                            else console.error(format(FAILED_CREATE_GAME_LOG, [message.sender.id]))
                        }
                    )
                break;

            default:
                console.log(message);
        }
    }

    /**
     * Either we need to write the whole code of onMessage in one or we can create a array of callbacks
     * @param client
     */
    static privateChatListener(client) {
        client.onMessage((message) => App.callBacksForChat.forEach(f => f(message)));
    }

    static async timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

App.main();

