import {createUniqueKey} from "../util/index.js";
import App from "../App.js";
import {BOT_USER_ID, MISSING_OPTIONAL_ARGUMENT} from "../constantsp/index.js";

class Game {
    static GROUP_CREATION_TIMEOUT = 1000;

    constructor(host, groupId) {
        this.host = host;
        this.id = createUniqueKey(App.gameIdToGameMap);
        this.groupName = "HOUSIE_GAME_" + this.id;
        this.groupId = groupId;
        this.participants = [];
        this.createdOn = Date.now();
    }

    async createGroup(client) {
        console.log(this.groupName, this.participants.concat(BOT_USER_ID));

        let response = await client.createGroup(
            this.groupName,
            this.participants
        );

        console.log(response);
        return response.gid.user
            .toString()
            .concat("@", response.gid.server.toString());
    }

    async addParticipantToGroup(client, participant) {
        client.addParticipant(this.groupId, participant.id)
            .catch(() => console.warn(MISSING_OPTIONAL_ARGUMENT))

        App.playerIdToGameIdMap.set(participant.id, this.id)

        await client.promoteParticipant(this.groupId, participant.id)

        this.participants.concat(participant);
    }

    async groupListener(client) {
        client.onParticipantsChanged(this.groupId, (x) => console.log(x))
    }

    static async createGame(host, client, newGroupId) {
        let game = new Game(host, newGroupId);
        return game.addParticipantToGroup(client, host)
            // .then(() => game.groupListener(client))
            .then(() => game)
        // .catch(() => console.warn(MISSING_OPTIONAL_ARGUMENT))
    }
}

export {Game};
