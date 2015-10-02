import 'index.scss';

import Stats from 'stats.js';
import Game from 'game';
import AmoebaSimulation from 'amoeba_simulation';

document.addEventListener("DOMContentLoaded", () => {
    var stats = new Stats();
    stats.setMode(1);

    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "0px";
    stats.domElement.style.top = "0px";
    document.body.appendChild(stats.domElement);

    var game;
    switch(window.location.hash) {
        case "#simulation":
            game = new AmoebaSimulation("glcontainer");
            break;
        default:
            game = new Game("glcontainer");
            break;
    }

    game.init();

    const animate = () => {
        stats.begin();

        game.update();
        game.render();

        stats.end();

        requestAnimationFrame(animate);
    };

    animate();
});
