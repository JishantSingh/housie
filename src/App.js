import { Game } from "./game/Game.js";
import sulla from "sulla/dist/index.js";
import {
  CREATE_NEW_GAME,
  CREATING_NEW_GAME,
  WELCOME,
  BOT_USER_ID,
  BYE,
  SEND_GAME_ID,
  UNIQUE_GAME_PER_USER_CONSTRAINT,
  JOIN_GAME,
  INVALID_GAME_ID,
  GROUP_IDS,
} from "./constantsp/index.js";
import { format } from "./util/index.js";

export default class App {
  static client;
  static groupIdToGameMap = new Map();
  static gameIdToGameMap = new Map();
  static hostIdToGameMap = new Map();
  static playerToGameMap = new Map();
  static GroupIdToFreeMap = new Map();
  static CallBacksForChat = [App.callback1]; //This will contain all unctions for
  static main() {
    GROUP_IDS.forEach((i) => {
      App.GroupIdToFreeMap.set(i, 1);
    }); //set all groups to free
    return sulla.create("web_session").then((client) => {
      App.client = client;
      App.privateChatListener(client);

      // App.createNewGame("380938304370@c.us", ["918847586471@c.us"])
      // App.runApp("")
    });
  }

  static async clearGroups(client) {

  }


  static async createNewGame(message) {
    const senderId = message.from;
    const chatId = message.chatId;
    const senderName = message.sender.pushname;
    //Issue 3 : here once the senderName came undefined not sure how
    //Although it was not reproduced

    //Issue 2: This check is not Working. Same person can create lots of different Group
    //Reason : HostId has Bot ID. refer Issue 1. Mostly change hostIdToGameMap to playerToGameMap is enough
    if (App.playerToGameMap.has(message.from)) {
      //Return His earlier Games Id
      await App.client.sendText(chatId, UNIQUE_GAME_PER_USER_CONSTRAINT);
      return;
    }
    await App.client.sendText(chatId, format(WELCOME, [senderName]));
    await App.client.sendText(chatId, CREATING_NEW_GAME);

    let newGroupId = Game.findFree();
    //This need to be done here as in createGame we are updating lots of arrays

    //Todo: Change the below sentence
    if (newGroupId == "-1") {
      await App.client.sendText(
        chatId,
        "We don't have time for fuckers like you"
      );
      // App.GroupIdtoFreeMap.set(GROUP_IDS[0], 1); //Testing
      return;
    }

    //Issue 1 : WHy are we using BOT_USER_ID as the hostid ? Shouldn't we use ID of person who sent ng?
    let game = await Game.createGame(
      BOT_USER_ID,
      [senderId],
      App.client,
      newGroupId
    );

    await App.client.sendText(
      chatId,
      format(SEND_GAME_ID, [senderName, game.id])
    );
    await App.client.sendText(chatId, format(BYE, [senderName]));
  }

  static callback1(message) {
    switch (message.body) {
      case CREATE_NEW_GAME:
        //need to avoid 2 guys getting the same game
        App.createNewGame(message);
        break;

      case JOIN_GAME:
        App.joinGame(message);
        break;

      default:
        console.log(message.body);
    }
  }

  static privateChatListener(client) {
    //Either we need to write the whole code of onMessage in one or we can create a array of callbacks
    client.onMessage((message) => {
      var i;
      for (i = 0; i < App.CallBacksForChat.length; i++) {
        //console.log(i);
        App.CallBacksForChat[i](message);
      }
    });
  }

  static async timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async joinGame(message) {
    const senderId = message.from;
    const chatId = message.chatId;
    const senderName = message.sender.pushname;
    if (App.playerToGameMap.has(senderId)) {
      await App.client.sendText(chatId, UNIQUE_GAME_PER_USER_CONSTRAINT);
      return;
    }
    App.client.sendText(chatId, "Please paste the GameID");
    var gameId;

    //For now I'm wating 3s but ideally we should kee rerying until he enters
    await App.timeout(3000);
    await Promise.all([
      App.client.loadAndGetAllMessagesInChat(chatId).then((chats) => {
        console.log(chats[chats.length - 1].body);
        gameId = parseInt(chats[chats.length - 1].body);
        console.log(gameId);
      }),
    ]);
    //TODO : Here we should retry sometime

    // let gameId = await App.client.onMessage((message1) =>
    //   parseInt(message1.body)
    // );

    console.log(App.gameIdToGameMap);
    if (!App.gameIdToGameMap.has(gameId)) {
      await App.client.sendText(chatId, INVALID_GAME_ID, message.id.toString());
      return;
    }
    let game = App.gameIdToGameMap.get(gameId);
    console.log(senderId);
    game.addParticipant(senderId);
  }
}

App.main();
// .then(app => app.createNewGame("380938304370@c.us", ["918847586471@c.us"]))
// .then((game) => gm = game)
// .then(() => console.log(gm))
// .then(() => gm.mkGroup())
// .then((x) => console.log("1. -> " + x))
// .then(() => console.log("2. ->  " + gm.groupId))
// .then(() => gm.addParticipants("917318019101@c.us"))
// .then(() => gm.addParticipants([""]))
