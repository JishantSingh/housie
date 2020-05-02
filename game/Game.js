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

    mkGroup() {
        console.assert(this.participants.length > 0,
            "At least 2 participants required to initiate a group")
        this.client.createGroup(this.groupName, this.participants)
            .then((response) =>
                new Promise((resolve, reject) =>
                    setTimeout(() => resolve(this.setGid(response)), this.GROUP_CREATION_TIMEOUT)))
    }

    setGid(createGroupResponse) {
        this.groupId = createGroupResponse.gid.user.toString().concat("@", createGroupResponse.gid.server.toString())
        return this.groupId
    }

    addParticipants(participant) {
        console.log("entered addParticipant")
        // participants.forEach(participant => this.client.addParticipant(this.groupId.toString(), participant))
        this.client.addParticipant(this.groupId, participant)
        // this.participants = this.participants.concat(participants);
    }

    static createGame(host, participants, client) {
        return new Game(host, participants, client);
    }

}

export {Game as Game};