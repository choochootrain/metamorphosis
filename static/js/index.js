import '../css/style.css';

import Game from 'game';

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game("glcontainer");

    game.init();

    const animate = () => {
        requestAnimationFrame(animate);
        game.update();
        game.render();
    };

    animate();
});
