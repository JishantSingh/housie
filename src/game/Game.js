import {createUniqueKey} from "../util/index.js";
import App from "../App.js";
import {BOT_USER_ID, ADD_REMOVE_PARTICIPANT_KNOWN_ERROR} from "../constantsp/index.js";

class Game {
    static GROUP_CREATION_TIMEOUT = 1000;

    constructor(hostId, client, groupId) {
        this.client = client;
        this.hostId = hostId;
        this.id = createUniqueKey(App.gameIdToGameMap);
        this.groupName = "HOUSIE_GAME_" + this.id;
        this.groupId = groupId;
        this.participants = [];
        this.createdOn = Date.now();
    }

    async createGroup() {
        console.log(this.groupName, this.participants.concat(BOT_USER_ID));

        let response = await this.client.createGroup(
            this.groupName,
            this.participants
        );

        console.log(response);
        return response.gid.user
            .toString()
            .concat("@", response.gid.server.toString());
    }

    async addParticipant(userId) {
        await this.client.addParticipant(this.groupId, userId)
            .catch(e => console.log(ADD_REMOVE_PARTICIPANT_KNOWN_ERROR))
        App.playerIdToGameMap.set(userId, this);
        this.participants.concat(userId);
    }


    static async createGame(hostId, client, newGroupId) {
        let game = new Game(hostId, client, newGroupId);

        await game.addParticipant(game.participants[0]);
        // await game.add
        // game.groupId = await game.createGroup();
        return game;
    }
}

export {Game};
