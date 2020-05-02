import {Game} from './game/Game.js'
import sulla from 'sulla/dist/index.js'

class App {
    constructor(client) {
        this.client = client;
    }

    static main() {
        return sulla.create("web_session").then((client) => {
            return new App(client);
        });
    }

    createNewGame(host, participants) {
        return Game.createGame(host, participants, this.client);
    }

}

let gm;
App.main()
    .then(app => app.createNewGame("380938304370@c.us", ["918847586471@c.us"]))
    .then((game) => gm = game)
    .then(() => console.log(gm))
    .then(() => gm.mkGroup())
    .then((x) => console.log("1. -> " + x))
    .then(() => console.log("2. ->  " + gm.groupId))
    .then(() => gm.addParticipants("917318019101@c.us"))
// .then(() => gm.addParticipants([""]))