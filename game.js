const initForm = (createMapCallback, stoneStack) => {
    const formDom = document.getElementById('map-initializer-form');

    formDom.addEventListener('submit' , function (e) {
        e.preventDefault();

        //stoneStack 의 length 가 0일 때만 제출 버튼을 클릭할 수 있다.
        if (stoneStack.length !== 0) {
            console.log('Cannot submit when game is started!');
            return;
        }

        const width = formDom.querySelector('[name="width"]').value;

        if (isValidWidth(width))
            createMapCallback(width);
        else
            notice('바둑판의 너비는 10 이상, 19 이하입니다!');
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

    while (mapDom.firstChild) {
        mapDom.removeChild(mapDom.lastChild);
    }



    for (let i = 0; i < height; i++) {
        const row = [];
        const rowDom = document.createElement('div');
        rowDom.className = 'row';

        for (let j = 0; j < width; j++) {
            const columnDom = document.createElement('div');
            columnDom.className = 'column';
            columnDom.textContent = ``;
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

const startGame = (currentTurn, turn, map, stoneStack, startTime, timer) => {
    currentTurn = turn;

    map.forEach(row => {
        row.forEach(column => {
            column.dom.addEventListener('click', function handler() {
                if (timer.isGameEnded)
                    return;

                notice('');

                const stone = peek(stoneStack);
                if (isSamePlace(stone, column) && stoneStack.length !== 1) {
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

                if (stoneStack.length === 1) {
                    startTime = Date.now();
                    startTimer(timer, startTime);
                }

                if (is33(stoneStack, column)) {
                    notice('이어지는 3,3을 완성시키는 착수는 금지합니다!');
                    undo(map, stoneStack);
                    currentTurn = switchTurn(currentTurn);
                    return;
                }

                if(isGameEnded(stoneStack, column)) {
                    endGame(column, timer);
                    timer.isGameEnded = true;
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
    column.dom.textContent = '';
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
    return !column.stone;
}

function startTimer(timer, startTime) {
    timer.timerId =  setInterval(() => {
        const endTime = Date.now();
        const totalSeconds = (endTime - startTime) / 1000;

        const hours = formatTime(Math.floor(totalSeconds / 3600));
        const minutes = formatTime(Math.floor((totalSeconds % 3600) / 60));
        const seconds = formatTime(Math.floor((totalSeconds % 3600) % 60));
        const timeElapsed = document.getElementById('time-elapsed');
        timeElapsed.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

function formatTime(time) {
    return time < 10 ? '0' + time : time;
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
        .length > 0;
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
        .length > 0;
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
        .length > 0;
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
        .length > 0;
}

const is33 = (stoneStack, column) => {
    const array = [];
    array.push(isThisStoneMakeConnectedStonesInRow(stoneStack, column, 3))
    array.push(isThisStoneMakeConnectedStonesInColumn(stoneStack, column, 3))
    array.push(isThisStoneMakeConnectedStonesInFirstDiagonal(stoneStack, column, 3))
    array.push(isThisStoneMakeConnectedStonesInSecondDiagonal(stoneStack, column, 3))

    return array.filter(e => e)
        .length === 2;
}

const endGame = (column, timer) => {
    // 게임 종료 처리.
    notice(`${translateStone(column.stone)}의 승리입니다!`);
    endTimer(timer, null);
};

const notice = (text) => {
    const notice = document.getElementById('notice');
    notice.textContent = text;
}

const translateStone = (stone) => {
    if (stone === 'black') {
        return '흑';
    } else {
        return '백';
    }
}

const addRestartListener = (map, stoneStack, timer) => {
    const buttons = document.querySelectorAll('button');
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent.includes('Restart')) {
            buttons[i].addEventListener('click', function () {
                while (peek(stoneStack)) {
                    undo(map, stoneStack);
                }
                endTimer(timer, '00:00:00');
                notice('');
                timer.isGameEnded = false;
            });
            break;
        }
    }
};

function endTimer(timer, timeText) {
    clearInterval(timer.timerId);
    const timeElapsed = document.getElementById('time-elapsed');

    if (timeText) {
        timeElapsed.textContent = timeText;
    }
}

const main = () => {
    let map = [];
    let currentTurn = null;
    const stoneStack = [];
    let startTime = null;
    let timer = { timerId: 0, isGameEnded: false };

    notice('바둑판의 너비를 입력하세요.');
    initForm(width => {
        notice('');
        map = createMap(width);
        startGame(currentTurn, 'black', map, stoneStack, startTime, timer);
        addRestartListener(map, stoneStack, timer);
        //TODO Implement White Black Button
    }, stoneStack);
};

main();