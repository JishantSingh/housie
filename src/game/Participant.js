export class Participant {
    id;
    groupId;
    gameId;
    name;
    chatId;
    constructor(id) {
        this.id = id
        this.chatId = id
    }
}