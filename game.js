const initForm = (createMapCallback) => {
    const formDom = document.getElementById('map-initializer-form');

    formDom.addEventListener('submit' , function (e) {
        e.preventDefault();
        const width = formDom.querySelector('[name="width"]').value;

        if (isValidWidth(width))
            createMapCallback(width)
        else
            alert('The width must be 10 or more and 19 or less!')
    })
}

const isValidWidth = (width) => {
    return 10 <= width && width <= 19;
}

const createMap = (width) => {
    const _map = [];
    const height = width;

    const mapDom = document.getElementById('map');
    mapDom.innerHTML = '';

    for (let i = 0; i < height; i++) {
        const row = [];
        const rowDom = document.createElement('div');
        rowDom.className = 'row';

        for (let j = 0; j < width; j++) {
            const columnDom = document.createElement('div');
            columnDom.className = 'column';
            columnDom.textContent = `➕`;
            rowDom.appendChild(columnDom);

            const column = {
                x: i,
                y: j,
                dom: columnDom,
                stone: null,
            };

            mapDom.appendChild(rowDom);
            row.push(column);
        }
        _map.push(row);
    }

    return _map;
}

const startGame = (currentTurn, turn, map) => {
    currentTurn = turn;

    map.forEach(row => {
        row.forEach(cell => {
            cell.dom.addEventListener('click', function() {
                cell.stone = currentTurn;
                if (currentTurn === 'black') {
                    cell.dom.textContent = '⚫️';
                    currentTurn = 'white';
                } else {
                    cell.dom.textContent = '⚪️';
                    currentTurn = 'black';
                }

                if(isGameEnded(cell)) {
                    endGame();
                }
            });
        });
    });
}

const isGameEnded = (map) => {
    //가로 검사
    //세로 검사
    //대각1 검사
    //대각2 검사
    return false;
};

const endGame = () => {
    // 게임 종료 처리.
};

const main = () => {
    let map = [];
    let currentTurn = null;

    initForm(width => {
        map = createMap(width);
        startGame(currentTurn, 'black', map);
    });
};

main();