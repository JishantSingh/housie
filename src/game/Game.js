import {createUniqueKey} from "../util/index.js";
import App from '../App.js'
import {BOT_USER_ID} from "../constantsp/index.js";

class Game {
    static GROUP_CREATION_TIMEOUT = 1000;

    constructor(host, participants, client) {
        this.client = client;
        this.hostId = host;
        this.id = 99999996;
        this.participants = participants;
        this.groupName = host.concat("_", "group", Math.ceil(Math.random() * 100));
        this.createdOn = Date.now()
    }

    async createGroup() {
        let response = await this.client.createGroup(this.groupName, this.participants.concat(BOT_USER_ID))
        return response.gid.user.toString().concat("@", response.gid.server.toString())
    }

    async addParticipant(userId) {
        await this.client.addParticipant(this.groupId, userId)
        App.playerToGameMap.set(userId, this)
        this.participants.concat(userId)
    }

    static async createGame(host, participants, client) {
        let game = new Game(host, participants, client);
        game.id = createUniqueKey(App.gameIdToGameMap)
        App.gameIdToGameMap.set(game.id, game);
        App.hostIdToGameMap.set(game.hostId, game);
        App.groupIdToGameMap.set(game.groupId, game);
        App.playerToGameMap.set(game.hostId, game)
        console.log("calling createGroup")
        game.groupId = await game.createGroup();
        return game;
    }

}

export {Game as Game};