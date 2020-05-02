import { createUniqueKey } from "../util/index.js";
import App from "../App.js";
import { BOT_USER_ID } from "../constantsp/index.js";

class Game {
  static GROUP_CREATION_TIMEOUT = 1000;

  constructor(host, participants, client) {
    this.client = client;
    this.hostId = host;
    this.id = 99999996;
    this.participants = participants;
    this.groupName = host.concat("_", "group", Math.ceil(Math.random() * 100));
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
    try {
      await this.client.addParticipant(this.groupId, userId);
    } catch (error) {
      //Add Participant has known error
      //https://github.com/danielcardeenas/sulla/issues/270
      console.log("Participant Added but with know error");
    }
    App.playerToGameMap.set(userId, this);
    this.participants.concat(userId);
  }

  static findFree() {
    //This must be done after taking a lock
    var key, value;
    for ([key, value] of App.GroupIdtoFreeMap) {
      if (value == 1) {
        App.GroupIdtoFreeMap.set(key, 0);
        return key;
      }
    }
    return "-1";
  }

  static async createGame(host, participants, client, newGroupId) {
    //both host and participants are ids
    let game = new Game(host, participants, client);
    game.id = createUniqueKey(App.gameIdToGameMap);
    App.gameIdToGameMap.set(game.id, game);
    App.hostIdToGameMap.set(game.hostId, game);
    App.groupIdToGameMap.set(game.groupId, game);
    App.playerToGameMap.set(game.hostId, game);
    console.log("calling createGroup");
    //game.groupId = Game.findFree();

    //Issue 4: We need to have a variable convention for Id with @ and id's without @ it's really confusing
    game.groupId = newGroupId + "@g.us";
    console.log(game.groupId);
    console.log(game.participants[0]);
    await game.addParticipant(game.participants[0]);
    // await game.add
    // game.groupId = await game.createGroup();
    return game;
  }
}

export { Game };
