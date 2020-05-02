class Game {
    constructor(host, participants, client) {
        this.client = client;
        this.host = host;
        this.id;
        this.participants = participants;
        this.groupName = host.concat("_", "group", Math.ceil(Math.random() * 100));
    }

    mkGroup() {
        this.groupId = this.client.createGroup(this.groupName, this.participants);
        return this.groupId;
    }

    addParticipants(participants) {
        this.participants = this.participants.concat(participants);
    }

    static createGame(host, participants, client) {
        return new Game(host, participants, client);
    }

}
export {Game as Game};