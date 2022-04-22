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

const startGame = (currentTurn, turn, map, stoneStack) => {
    currentTurn = turn;

    map.forEach(row => {
        row.forEach(column => {
            column.dom.addEventListener('click', function() {

                const stone = peek(stoneStack);
                if (isSamePlace(stone, column)) {
                    undo(map, stoneStack);
                    currentTurn = switchTurn(currentTurn);
                    return;
                }

                if (!isEmptyPlace(column))
                    return;

                column.stone = currentTurn;
                if (currentTurn === 'black') {
                    column.dom.textContent = '⚫️';
                    currentTurn = 'white';
                } else {
                    column.dom.textContent = '⚪️';
                    currentTurn = 'black';
                }

                stoneStack.push(column);

                if (is33(stoneStack, column)) {
                    undo(map, stoneStack);
                    currentTurn = switchTurn(currentTurn);
                    return;
                }

                if(isGameEnded(stoneStack, column)) {
                    endGame();
                }
            });
        });
    });
}

function peek(stack) {
    if (stack.length === 0)
        return null;

    return stack[stack.length - 1];
}

function isSamePlace(stone, column) {
    if (!stone)
        return false;

    return stone.x === column.x && stone.y === column.y;
}

function undo(map, stoneStack) {
    const stone = stoneStack.pop();
    const column = map[stone.x][stone.y];
    column.dom.textContent = '➕';
    column.stone = null;
}

function switchTurn(currentTurn) {
    if (currentTurn === 'black') {
        return 'white';
    } else {
        return 'black';
    }
}

function isEmptyPlace(column) {
    return !column.stone
}

const isGameEnded = (stoneStack, column) => {
    return isThisStoneMakeConnectedStonesInRow(stoneStack, column, 5) ||
        isThisStoneMakeConnectedStonesInColumn(stoneStack, column, 5) ||
        isThisStoneMakeConnectedStonesInFirstDiagonal(stoneStack, column, 5) ||
        isThisStoneMakeConnectedStonesInSecondDiagonal(stoneStack, column, 5);
};

const isThisStoneMakeConnectedStonesInRow = (stoneStack, column, n) => {
    return stoneStack.filter(stone =>
        stone.stone === column.stone && stone.x === column.x)
        .map(stone => stone.y)
        .sort((a, b) => a - b)
        .reduce((array, currentValue) => {
            const lastSubArray = array[array.length - 1];

            if(!lastSubArray || lastSubArray[lastSubArray.length - 1] !== currentValue - 1) {
                array.push([]);
            }

            array[array.length - 1].push(currentValue);

            return array;
        }, [])
        .filter(subArray => subArray.includes(column.y) && subArray.length === n)
        .length > 0
}

const isThisStoneMakeConnectedStonesInColumn = (stoneStack, column, n) => {
    return stoneStack.filter(stone =>
        stone.stone === column.stone && stone.y === column.y)
        .map(stone => stone.x)
        .sort((a, b) => a - b)
        .reduce((array, currentValue) => {
            const lastSubArray = array[array.length - 1];

            if(!lastSubArray || lastSubArray[lastSubArray.length - 1] !== currentValue - 1) {
                array.push([]);
            }

            array[array.length - 1].push(currentValue);

            return array;
        }, [])
        .filter(subArray => subArray.includes(column.x) && subArray.length === n)
        .length > 0
}

const isThisStoneMakeConnectedStonesInFirstDiagonal = (stoneStack, column, n) => {
    return stoneStack.filter(stone =>
        stone.stone === column.stone && (stone.y - column.y) === (stone.x - column.x))
        .sort((a, b) => a.x - b.x)
        .reduce((array, currentStone) => {
            const lastSubArray = array[array.length - 1];

            if(!lastSubArray || !lastSubArray[lastSubArray.length - 1]
                || lastSubArray[lastSubArray.length - 1].x !== currentStone.x - 1
                || lastSubArray[lastSubArray.length - 1].y !== currentStone.y - 1) {
                array.push([]);
            }

            array[array.length - 1].push(currentStone);

            return array;
        }, [])
        .filter(subArray => subArray.includes(column) && subArray.length === n)
        .length > 0
}

const isThisStoneMakeConnectedStonesInSecondDiagonal = (stoneStack, column, n) => {
    return stoneStack.filter(stone =>
        stone.stone === column.stone && (stone.y - column.y) === -(stone.x - column.x))
        .sort((a, b) => a.y - b.y)
        .reduce((array, currentStone) => {
            const lastSubArray = array[array.length - 1];

            if(!lastSubArray || !lastSubArray[lastSubArray.length - 1]
                || lastSubArray[lastSubArray.length - 1].x !== currentStone.x + 1
                || lastSubArray[lastSubArray.length - 1].y !== currentStone.y - 1) {
                array.push([]);
            }

            array[array.length - 1].push(currentStone);

            return array;
        }, [])
        .filter(subArray => subArray.includes(column) && subArray.length === n)
        .length > 0
}

const is33 = (stoneStack, column) => {
    const array = [];
    array.push(isThisStoneMakeConnectedStonesInRow(stoneStack, column, 3))
    array.push(isThisStoneMakeConnectedStonesInColumn(stoneStack, column, 3))
    array.push(isThisStoneMakeConnectedStonesInFirstDiagonal(stoneStack, column, 3))
    array.push(isThisStoneMakeConnectedStonesInSecondDiagonal(stoneStack, column, 3))

    return array.filter(e => e)
        .length === 2
}

const endGame = () => {
    // 게임 종료 처리.
    console.log('game is ended!');
};

const main = () => {
    let map = [];
    let currentTurn = null;
    const stoneStack = [];

    initForm(width => {
        map = createMap(width);
        startGame(currentTurn, 'black', map, stoneStack);
    });
};

main();