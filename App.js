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
var gm;
App.main()
    .then(app => app.createNewGame("HousieHost", []))
    .then((game) => {gm = game;game.mkGroup()})
    .then(() => gm.addParticipants(["380938304370@c.us"]))