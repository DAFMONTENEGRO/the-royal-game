class Chess {

    constructor(chessboard = 'default') {
        this.pieces = {};
        this.reference = {};
        this.movements = '';
        this.whiteGame = true;
        this.lightColor = [255];
        this.notationColor = [0];
        this.screenMovements = '';
        this.darkColor = [0, 155, 125];
        this.selectionColor = [255, 0, 0];
        let names = ['Db', 'Rb', 'Ab', 'Cb', 'Tb', 'Pb', 'Pn', 'Tn', 'Cn', 'An', 'Dn', 'Rn']
        for (let i = 0; i < 12; i++) {
            this.pieces[names[i]] = loadImage('images/classic-pieces/' + names[i] + '.png');
        }
        this.chessboard = loadJSON('json/' + chessboard + '.json');
    }

    reload() {
        push();
        noStroke();
        background(128);
        fill(this.lightColor);
        this.reference['size'] = min(windowWidth, windowHeight);
        this.reference['square'] = this.reference['size'] / 10;
        this.reference['originX'] = (windowWidth - this.reference['size']) / 2;
        this.reference['originY'] = (windowHeight - this.reference['size']) / 2;
        translate(this.reference['originX'], this.reference['originY']);
        rect(this.reference['square'], this.reference['square'], this.reference['size'] * 8 / 10, this.reference['size'] * 8 / 10);
        for (let y = 1; y < 9; y++) {
            let rectX = (1 + y % 2) * this.reference['square'];
            let positionY = y * this.reference['square'];
            for (let x = 1; x < 9; x++) {
                let notation = String.fromCharCode(96 + x) + (9 - y);
                this.reference[notation] = [x * this.reference['square'], positionY];
                if (x % 2) {
                    noStroke();
                    fill(this.darkColor);
                    rect(rectX, positionY, this.reference['square'], this.reference['square']);
                }
                fill(255);
                textSize(this.reference['size'] / 60);
                stroke(this.notationColor);
                text(notation, this.reference[notation][0] + 3, positionY + this.reference['size'] / 60);
                if (this.chessboard[notation]) {
                    image(this.pieces[this.chessboard[notation]], this.reference[notation][0] + this.reference['square'] / 6,
                        positionY, this.reference['square'] * 2 / 3, this.reference['square']);
                }
                rectX += this.reference['square'];
            }
        }
        this.background = get();
        pop();
    }

    location() {
        if (this.moved || this.clicked) {
            image(this.background, 0, 0);
            let row = 9 - Math.floor((mouseY - this.reference['originY']) / this.reference['square']);
            let column = Math.floor((mouseX - this.reference['originX']) / this.reference['square']);
            if (column > 0 && column < 9 && row > 0 && row < 9) {
                this.currentNotation = String.fromCharCode(96 + column) + row;
                if (this.clicked) {
                    this.move();
                    if (this.selectionNotation != this.currentNotation) {
                        this.row = row;
                        this.column = column;
                        this.selectionNotation = this.currentNotation;
                        this.movements = this.positionMovements();
                        this.screenMovements = this.movements + this.selectionNotation;
                    } else {
                        this.selectionNotation = '';
                        this.screenMovements = '';
                        this.movements = '';
                        this.column = 0;
                        this.row = 0;
                    }
                    this.clicked = false;
                }
                this.selectSquares(this.screenMovements.split('.'), [255, 255, 0], [255, 128, 0], this.movements);
                this.selectSquares([this.currentNotation], this.selectionColor);
            } else {
                this.currentNotation = undefined;
            }
            this.moved = !this.moved;
        }
    }

    selectSquares(movements, firstColor, secondColor, message = '') {
        push();
        noFill();
        strokeWeight(3);
        translate(this.reference['originX'], this.reference['originY']);
        for (let movement of movements) {
            stroke(firstColor);
            if (movement.length > 2) {
                if (movement.indexOf('x') != -1) {
                    stroke(secondColor);
                }
                movement = movement.slice(-2);
            }
            if (movement.length == 2) {
                rect(this.reference[movement][0], this.reference[movement][1], this.reference['square'], this.reference['square']);
            }
        }
        fill(255);
        strokeWeight(1);
        textSize(this.reference['size'] / 60);
        stroke(this.notationColor);
        text(message, this.reference['square'], this.reference['square'] / 2 + this.reference['size'] / 120);
        pop();
    }

    motionSummary(step) {
        let nextRow = this.row + step[1];
        let nextColumn = this.column + step[0];
        if (0 < nextRow && nextRow < 9 && 0 < nextColumn && nextColumn < 9) {
            let movementNotation = String.fromCharCode(96 + nextColumn) + nextRow;
            let isP = this.chessboard[this.selectionNotation].charAt(0) == 'P';
            if (this.chessboard[movementNotation]) {
                if (this.chessboard[this.selectionNotation].charAt(1) != this.chessboard[movementNotation].charAt(1)) {
                    if (isP) {
                        return this.selectionNotation.charAt(0) + 'x' + movementNotation;
                    } else {
                        return this.chessboard[this.selectionNotation].charAt(0) + 'x' + movementNotation;
                    }
                }
            } else {
                if (isP) {
                    return movementNotation;
                } else {
                    return this.chessboard[this.selectionNotation].charAt(0) + movementNotation;
                }
            }
        }
        return "";
    }

    linealMovements(step, step_column = 0, step_row = 0) {
        step_row += step[1];
        step_column += step[0];
        let movement = this.motionSummary([step_column, step_row]);
        if (movement) {
            movement += '.';
            if (!movement.includes('x')) {
                movement += this.linealMovements(step, step_column, step_row);
            }
            return movement;
        }
        return "";
    }

    castleBishopQueenMovements(steps) {
        if (steps.length > 0) {
            return this.linealMovements(steps.shift()) + this.castleBishopQueenMovements(steps);
        } else {
            return "";
        }
    }

    kingKnightMovements(steps) {
        if (steps.length > 0) {
            let step = steps.shift();
            let movement = this.motionSummary([step[0], step[1]]);
            if (movement) {
                movement += '.';
            }
            return movement + this.kingKnightMovements(steps);
        } else {
            return "";
        }
    }

    pawnMovements(movements = '', steps = [], jump = false) {
        let pawnColor = this.chessboard[this.selectionNotation].charAt(1);
        if (pawnColor == 'b') {
            steps = [this.motionSummary([0, 1]), this.motionSummary([-1, 1]), this.motionSummary([1, 1]), this.motionSummary([0, 2]), 1];
            jump = this.selectionNotation.charAt(1) == '2';
        } else {
            steps = [this.motionSummary([0, -1]), this.motionSummary([-1, -1]), this.motionSummary([1, -1]), this.motionSummary([0, -2]), -1];
            jump = this.selectionNotation.charAt(1) == '7';
        }
        jump = jump && !this.chessboard[String.fromCharCode(96 + this.column) + (this.row + steps[4])];
        jump = jump && !this.chessboard[String.fromCharCode(96 + this.column) + (this.row + steps[4] * 2)];
        let conditionals = [!steps[0].includes('x'), steps[1].includes('x'), steps[2].includes('x'), jump];
        for (let i = 0; i <= 3; i++) {
            if (conditionals[i]) {
                if (steps[i]) {
                    movements += steps[i] + '.';
                }
            }
        }
        return movements;
    }

    positionMovements(movements = '', colorGame = '') {
        if (this.whiteGame) {
            colorGame = 'b';
        } else {
            colorGame = 'n';
        }
        if (this.chessboard[this.selectionNotation].charAt(1) == colorGame) {
            switch (this.chessboard[this.selectionNotation].charAt(0)) {
                case 'T':
                    movements += this.castleBishopQueenMovements([[-1, 0], [0, -1], [1, 0], [0, 1]]);
                    break;
                case 'A':
                    movements += this.castleBishopQueenMovements([[1, 1], [1, -1], [-1, -1], [-1, 1]]);
                    break;
                case 'D':
                    movements += this.castleBishopQueenMovements([[-1, 0], [0, -1], [1, 0], [0, 1], [1, 1], [1, -1], [-1, -1], [-1, 1]]);
                    break;
                case 'C':
                    movements += this.kingKnightMovements([[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]]);
                    break;
                case 'R':
                    movements += this.kingKnightMovements([[-1, 0], [0, -1], [1, 0], [0, 1], [1, 1], [1, -1], [-1, -1], [-1, 1]]);
                    break;
                case 'P':
                    movements += this.pawnMovements();
                    break;
            }
        }
        return movements;
    }

    move() {
        let movements = this.movements.split('.');
        for (let movement of movements) {
            if (movement.length > 2) {
                movement = movement.slice(-2);
            }
            if (movement == this.currentNotation) {
                this.chessboard[this.currentNotation] = this.chessboard[this.selectionNotation];
                this.chessboard[this.selectionNotation] = '';
                this.whiteGame = !this.whiteGame;
                this.reload();
            }
        }
    }

}