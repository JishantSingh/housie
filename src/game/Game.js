class Game {
    const
    GROUP_CREATION_TIMEOUT = 1000;

    constructor(host, participants, client) {
        this.client = client;
        this.host = host;
        this.id;
        this.participants = participants.concat([host]);
        this.groupName = host.concat("__", "group", Math.ceil(Math.random() * 100));
    }

    async mkGroup() {
        console.assert(this.participants.length > 0,
            "At least 2 participants required to initiate a group")
        this.client.createGroup(this.groupName, this.participants)
            .then((response) => this.setGid(response))
    }

    async setGid(createGroupResponse) {
        this.groupId = await createGroupResponse.gid.user.toString().concat("@", await createGroupResponse.gid.server.toString())
        return this.groupId
    }

    addParticipants(participant) {
        console.log("entered addParticipant")
        // participants.forEach(participant => this.client.addParticipant(this.groupId.toString(), participant))
        this.client.addParticipant(this.groupId, participant)
        // this.participants = this.participants.concat(participants);
    }

    static async createGame(host, participants, client) {
        let game =  new Game(host, participants, client);
        // await game.mkGroup();
        return game;

    }

}

export {Game as Game};