import {createUniqueKey} from "../util/index.js";
import App from "../App.js";
import {BOT_USER_ID, MISSING_OPTIONAL_ARGUMENT, FAILED_CREATE_GAME_LOG} from "../constantsp/index.js";

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

    // async makeAdmin()

    async addParticipantToGroup(client, participant) {
        await client.addParticipant(this.groupId, participant.id)
            .catch(() => console.warn(MISSING_OPTIONAL_ARGUMENT))

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function checkParticipant(participantId, groupId) {
            let members = await client.getGroupMembersIds(groupId)
            let memberIds = members.map(x => x._serialized)
            return memberIds.includes(participantId)
        }

        let isParticipantAdded = false;
        let retires = 10
        while (!isParticipantAdded && retires > 0) {
            await sleep(2000)
            isParticipantAdded = await checkParticipant(participant.id, this.groupId)
                .catch(e => console.log(e))
            retires--;
        }
        if (!isParticipantAdded) throw FAILED_CREATE_GAME_LOG
        await client.promoteParticipant(this.groupId, participant.id)
            .catch((e) => console.warn(MISSING_OPTIONAL_ARGUMENT))

        this.participants.concat(participant);
        return true
    }

    async groupListener(client) {
        client.onParticipantsChanged(this.groupId, (x) => console.log(x))
    }

    static async createGame(host, client, newGroupId) {
        let game = new Game(host, newGroupId);
        return game.addParticipantToGroup(client, host)
            .then(() => game.groupListener(client))
            .then(() => game)
            .catch((e) => {
                console.log(e)
                return undefined
            })
        // .catch(() => console.warn(MISSING_OPTIONAL_ARGUMENT))
    }
}

export {Game};
