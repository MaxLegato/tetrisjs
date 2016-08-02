'use strict';

// global constants
var BOARD_WIDTH = 420;
var BOARD_HEIGHT = 690;
var TILE_WIDTH = 30;
var TILE_HEIGHT = 30;
var BOARD_ROWS = 20;
var BOARD_COLS = 10;
var SCORE_1_LINE = 10;
var SCORE_2_LINE = 20;
var SCORE_3_LINE = 30;
var SCORE_4_LINE = 50;

var NEW_GAME = false;
var GAME_RUNNING = false;
var GAME_OVER = false;

function inArray(needle, haystack) {
	
    var length = haystack.length;
    
	for (var i = 0; i < length; i++) {
		
        if (haystack[i] == needle) return true;
		
    }
	
    return false;
	
}

function cloneObject(obj) {
	
	return $.extend(true, {}, obj);
	
}

function debug(myBlock, myBoard) {
	
	$('#output1 code').empty();
	
	var html = '';
	
	html += '<div id="code-box-1" class="code-box">';
	
		html += '<p>myBlock.type: ' + myBlock.type + '<br />';
		html += 'myBlock.currentState: ' + myBlock.currentState + '<br />';
		html += 'myBlock.currentMatrix: ' + myBlock.currentMatrix.toString() + '<br />';
		html += 'myBlock.currentIndex: ' + myBlock.currentIndex + '</p>';
	
		html += '<p>myBlock.state_1_startIndex: ' + myBlock.state_1_startIndex + '<br />';
		html += 'myBlock.state_2_startIndex: ' + myBlock.state_2_startIndex + '<br />';
		html += 'myBlock.state_3_startIndex: ' + myBlock.state_3_startIndex + '<br />';
		html += 'myBlock.state_4_startIndex: ' + myBlock.state_4_startIndex + '</p>';
	
		html += '<p>myBlock.width: ' + myBlock.width + '<br />';
		html += 'myBlock.height: ' + myBlock.height + '</p>';

	html += '</div>';
	
	$('#output1 code').append(html);

	html = null;
	
	return;
	
}

function setGameOver(myBlock, myBoard, timer) {
	
	GAME_OVER = true;
	GAME_RUNNING = false;
	NEW_GAME = false;
	
	clearInterval(timer);

	for (var row = 0; row < BOARD_ROWS; row++) {
		
		for (var col = 0; col < BOARD_COLS; col++) {
			
			if (myBoard[row][col] != 0) {
				
				myBoard[row][col] = 'x';
				
			}
			
		}
		
	}
	
	row = 0;
	col = 0;
	
	drawBoard(myBoard);

	myBlock = null;
	myBoard = null;
	
	$('#myBoard-info').html('GAME OVER');
	$('#myBoard-info').show();
	
	$('#info-start-pause').html('Press <strong>F5</strong> to start over');
	$('#thescore').append('<br />GAME OVER!');
	
	return timer;
	
}

function getTileImage(type) {
	
	var image;
	
	switch (type) {
		
		case 'i' : image = 'TILE_ORANGE.png'; break;
		case 'j' : image = 'TILE_TEAL.png'; break;
		case 'l' : image = 'TILE_BLUE.png'; break;
		case 'o' : image = 'TILE_YELLOW.png'; break;
		case 's' : image = 'TILE_PURPLE.png'; break;
		case 't' : image = 'TILE_RED.png'; break;
		case 'z' : image = 'TILE_GREEN.png'; break;
		default : image = 'TILE.png'; break;
		
	}
	
	return image;
	
}

function drawBoardMatrix(myBoard) {
	
	$('#output2 code').empty();
	
	var html = '';
	
	html += '<p>Current myBoard</p>';
	html += '<table>';
	
	for (var row = 0; row < BOARD_ROWS; row++) {
		
		html += '<tr>';
		
		for (var col = 0; col < BOARD_COLS; col++) {

			html += '<td>';
			html += myBoard[row][col];
			html += '</td>';
			
		}
		
		html += '</tr>';
			
	}
	
	html += '</table>';
	
	$('#output2 code').append(html);
	
	html = null;
	row = null;
	col = null;
	
	return;
	
}

function updateScore(score, count) {
	
	switch (count) {
		
		case 1 : score += 10; break;
		case 2 : score += 20; break;
		case 3 : score += 30; break;
		case 4 : score += 50; break;
		default : break;
		
	}
	
	return score;
	
}

function groundBlock(myBlock) {
	
	var rows;
	var cols;
	
	for (rows = 0; rows < myBlock.height; rows++) {
		
		for (cols = 0; cols < myBlock.width; cols++) {
			
			if (myBlock.currentMatrix[rows][cols] != 0) {
				
				myBlock.currentMatrix[rows][cols] = myBlock.type;
				
			}
	
		}
		
	}
	
	return myBlock;
	
}

function removeLines(myBoard, lineStack) {

	var index;
	var row = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var temp = [];
	
	var newBoard = [];
	
	for (index = 0; index < BOARD_ROWS; index++) {
		
		if (inArray(index, lineStack) == false) {
			
			temp = myBoard[index].slice();
			newBoard.push(temp);
			
		} else {
			
			newBoard.unshift(row);
			
		}
		
	}
	
	temp = [];
	myBoard = [];
	
	newBoard = cloneObject(newBoard);
	
	return newBoard;
	
}

function checkLines(myBoard, lineStack) {
	
	var rows;
	var cols;
	
	var zero_count = 0;
	
	for (rows = 0; rows < BOARD_ROWS; rows++) {
		
		for (cols = 0; cols < BOARD_COLS; cols++) {
			
			if (myBoard[rows][cols] != 0) {
				
				zero_count++;
				
			}
			
			if (zero_count == BOARD_COLS) {
				
				if (inArray(rows, lineStack) == false) {
				
					lineStack.push(rows);
					
				}
				
			}
			
		}
		
		zero_count = 0;

	}
	
	return lineStack;
	
}

function checkCollisionBlock(myBlock, myBoard) {
	
	var block_width = myBlock.width;
	var block_height = myBlock.height;
	var block_index = myBlock.currentIndex;
	var block_matrix = myBlock.currentMatrix;
	
	var myBoard_row = block_index[0];
	var myBoard_col = block_index[1];

	for (var block_row = 0; block_row < block_height; block_row++) {
		
		for (var block_col = 0; block_col < block_width; block_col++) {
		
			if (block_matrix[block_row][block_col] == 1) {
				
				if (myBoard[myBoard_row][myBoard_col] != 0) {
					
					return true;
					
				}
				
			}
			
		
			myBoard_col++;
		
		}
		
		myBoard_col = block_index[1];
		myBoard_row++;
		
	}
	
	return false;
	
}

function checkCollisionBoard(myBlock, previousState) {
	
	if ( (myBlock.currentIndex[0] < 0) ||
		(myBlock.currentIndex[0] > (BOARD_ROWS - myBlock.height)) ||
		(myBlock.currentIndex[1] < 0) ||
		(myBlock.currentIndex[1] > (BOARD_COLS - myBlock.width)) ) {
		
		myBlock.currentState = previousState;
		
		switch (previousState) {
			
			case 1 :
				
				myBlock.currentIndex = myBlock.state_1_startIndex;
				myBlock.currentMatrix = myBlock.state_1_matrix;
				break;
				
			case 2 :
				
				myBlock.currentIndex = myBlock.state_2_startIndex;
				myBlock.currentMatrix = myBlock.state_2_matrix;
				break;
				
			case 3 :
				
				myBlock.currentIndex = myBlock.state_3_startIndex;
				myBlock.currentMatrix = myBlock.state_3_matrix;
				break;
				
			case 4 :
				
				myBlock.currentIndex = myBlock.state_4_startIndex;
				myBlock.currentMatrix = myBlock.state_4_matrix;
				break;
				
			default : break;

		}
		
		myBlock.width = myBlock.currentMatrix[0].length;
		myBlock.height = myBlock.currentMatrix.length;
	
	}
	
	return myBlock;
	
}

function rotateBlock(dir, myBlock, myBoard, lineStack) {
	
	myBoard = wipeBoard(myBlock, myBoard);
	
	var previousState = myBlock.currentState;
	
	switch (dir) {
		
		case 'left' :
			
			myBlock.currentState--;
			break;
			
		case 'right' :
		
			myBlock.currentState++;
			break;
			
		default:
			break;
		
	}
	
	if (myBlock.currentState == 5) myBlock.currentState = 1;	
	if (myBlock.currentState == 0) myBlock.currentState = 4;
	
	switch (myBlock.currentState) {
		
		case 1 :
			
			myBlock.currentIndex = myBlock.state_1_startIndex;
			myBlock.currentMatrix = myBlock.state_1_matrix;
			break;
			
		case 2 :
			
			myBlock.currentIndex = myBlock.state_2_startIndex;
			myBlock.currentMatrix = myBlock.state_2_matrix;
			break;
			
		case 3 :
			
			myBlock.currentIndex = myBlock.state_3_startIndex;
			myBlock.currentMatrix = myBlock.state_3_matrix;
			break;
			
		case 4 :
			
			myBlock.currentIndex = myBlock.state_4_startIndex;
			myBlock.currentMatrix = myBlock.state_4_matrix;
			break;
			
		default : break;

	}
	
	myBlock.width = myBlock.currentMatrix[0].length;
	myBlock.height = myBlock.currentMatrix.length;
	
	myBlock = checkCollisionBoard(myBlock, previousState);
	
	return myBlock;
	
}

function moveBlock(dir, myBlock, myBoard, lineStack) {
	
	myBoard = wipeBoard(myBlock, myBoard);

	switch (dir) {
	
		/*
		case 'up' :
			
			myBlock.state_1_startIndex[0]--;
			myBlock.state_2_startIndex[0]--;
			myBlock.state_3_startIndex[0]--;
			myBlock.state_4_startIndex[0]--;
			
			if (myBlock.currentIndex[0] < 0 || checkCollisionBlock(myBlock, myBoard)) {
				
				myBlock.state_1_startIndex[0]++;
				myBlock.state_2_startIndex[0]++;
				myBlock.state_3_startIndex[0]++;
				myBlock.state_4_startIndex[0]++;
				
			}
			
			break;
		*/
		
		case 'down' :

			myBlock.state_1_startIndex[0]++;
			myBlock.state_2_startIndex[0]++;
			myBlock.state_3_startIndex[0]++;
			myBlock.state_4_startIndex[0]++;
			
			// block has hit floor or another block
			if (myBlock.currentIndex[0] > (BOARD_ROWS - myBlock.height) || checkCollisionBlock(myBlock, myBoard)) {

				myBlock.state_1_startIndex[0]--;
				myBlock.state_2_startIndex[0]--;
				myBlock.state_3_startIndex[0]--;
				myBlock.state_4_startIndex[0]--;
				
				// ground the block, update the myBoard matrix
				myBlock = groundBlock(myBlock);
				myBlock.currentState = 0;
				
			}
			
			break;
			
		case 'left' :
		
			myBlock.state_1_startIndex[1]--;
			myBlock.state_2_startIndex[1]--;
			myBlock.state_3_startIndex[1]--;
			myBlock.state_4_startIndex[1]--;
			
			if (myBlock.currentIndex[1] < 0 || checkCollisionBlock(myBlock, myBoard)) {
				
				myBlock.state_1_startIndex[1]++;
				myBlock.state_2_startIndex[1]++;
				myBlock.state_3_startIndex[1]++;
				myBlock.state_4_startIndex[1]++;				
				
			}
			
			break;
			
		case 'right' :
		
			myBlock.state_1_startIndex[1]++;
			myBlock.state_2_startIndex[1]++;
			myBlock.state_3_startIndex[1]++;
			myBlock.state_4_startIndex[1]++;
			
			if (myBlock.currentIndex[1] > (BOARD_COLS - myBlock.width) || checkCollisionBlock(myBlock, myBoard)) {
			
				myBlock.state_1_startIndex[1]--;
				myBlock.state_2_startIndex[1]--;
				myBlock.state_3_startIndex[1]--;
				myBlock.state_4_startIndex[1]--;
			
			}
			
			break;
		
		default :
			break;
		
	}
	
	return myBlock;
	
}

function drawBoard(myBoard) {
	
	var type, tile, tileImage;
	var x, y;
	
	for (var row = 0; row < BOARD_ROWS; row++) {
		
		for (var col = 0; col < BOARD_COLS; col++) {
	
			if (myBoard[row][col] != 0 && myBoard[row][col] != 1) {
				
				type = myBoard[row][col];
				
				tileImage = getTileImage(type);
				
				tile = document.createElement("IMG");
				tile.setAttribute("class", "tile");
				tile.setAttribute("src", tileImage);
				tile.setAttribute("width", "30");
				tile.setAttribute("width", "30");
				
				x = col * 30;
				y = row * 30;
				
				tile.setAttribute("style", "left: " + x + "px; top: " + y + "px;");

				$('#myBoard').append(tile);
				
				type = null;
				tile = null;
				tileImage = null;
				x = null;
				y = null;
				
			}
	
		}
		
	}
	
	row = null;
	col = null;
	
	return;
	
}

function drawBlock(myBlock, myBoard) {
	
	var tile;
	var tileImage = myBlock.tileImage;
	var x, y;
	
	for (var row = 0; row < BOARD_ROWS; row++) {
		
		for (var col = 0; col < BOARD_COLS; col++) {
	
			if (myBoard[row][col] == 1) {
				
				tile = document.createElement("IMG");
				tile.setAttribute("class", "tile");
				tile.setAttribute("src", tileImage);
				tile.setAttribute("width", "30");
				tile.setAttribute("width", "30");
				
				x = col * 30;
				y = row * 30;
				
				tile.setAttribute("style", "left: " + x + "px; top: " + y + "px;");

				$('#myBoard').append(tile);
				
				tile = null;
				x = null;
				y = null;
				
			}
	
		}
		
	}
	
	row = null;
	col = null;
	
	return;
	
}

function updateBoard(myBoard, myBlock) {
	
	var width = myBlock.width;
	var height = myBlock.height;
	
	var myBoard_row = 0;
	var myBoard_col = 0;
	var block_row = 0;
	var block_col = 0;
	
	// iterate along myBoard and update with block matrix
	for (myBoard_row = myBlock.currentIndex[0]; myBoard_row < (height + myBlock.currentIndex[0]); myBoard_row++) {
		
		for (myBoard_col = myBlock.currentIndex[1]; myBoard_col < (width + myBlock.currentIndex[1]); myBoard_col++) {
			
			if (myBoard[myBoard_row][myBoard_col] == 0) {
			
				myBoard[myBoard_row][myBoard_col] = myBlock.currentMatrix[block_row][block_col];

			}
			
			block_col++;
			
		}
		
		block_row++;
		block_col = 0;
		
	}
	
	width = 0;
	height = 0;
	myBoard_row = 0;
	myBoard_col = 0;
	block_row = 0;
	block_col = 0;
	
	return myBoard;
	
}

function wipeBoard(myBlock, myBoard) {
	
	// start position
	var ins_row = myBlock.currentIndex[0];
	var ins_col = myBlock.currentIndex[1];
	
	var width = myBlock.width;
	var height = myBlock.height;
	
	var myBoard_row;
	var myBoard_col;
	var block_row = 0;
	var block_col = 0;
	
	// iterate along myBoard and update with block matrix
	for (myBoard_row = ins_row; myBoard_row < (height + ins_row); myBoard_row++) {
		
		for (myBoard_col = ins_col; myBoard_col < (width + ins_col); myBoard_col++) {
			
			if (myBoard[myBoard_row][myBoard_col] == 1) {
				
				myBoard[myBoard_row][myBoard_col] = 0;
				
			}
			block_col++;
			
		}
		
		block_row++;
		block_col = 0;
		
	}
	
	ins_row = null;
	ins_col = null;
	width = null;
	height = null;
	myBoard_row = null;
	myBoard_col = null;
	block_row = null;
	block_col = null;
	
	// remove existing block tiles
	$('.tile').remove();
	
	return myBoard;
	
}

function update(myBlock, myBoard) {
	
	drawBlock(myBlock, myBoard);
	
	drawBoard(myBoard);
	
	drawBoardMatrix(myBoard);
	
	//debug(myBlock, myBoard);
	
	return;
	
}

function initBlock() {
	
	var myBlock = {
		
		type: '',
		tileImage: '',
		currentState: 0,
		currentMatrix: [[]],
		currentIndex: [[]],
		state_1_matrix: [[]],
		state_1_startIndex: [[]],
		state_2_matrix: [[]],
		state_2_startIndex: [[]],
		state_3_matrix: [[]],
		state_3_startIndex: [[]],
		state_4_matrix: [[]],
		state_4_startIndex: [[]],
		width: 0,
		height: 0
		
	};
	
	var types = ['i', 'j', 'l', 'o', 's', 't', 'z'];
	var random = Math.floor(Math.random() * types.length);
	var state = Math.floor(Math.random() * 4) + 1;
	var type = types[random];

	myBlock.type = type;
	myBlock.currentState = state;
	
	switch (type) {
		
		case 'i' :
		
			myBlock.tileImage = 'TILE_ORANGE.png';
			myBlock.state_1_matrix = [ [1],[1],[1],[1],[1] ];
			myBlock.state_2_matrix = [ [1,1,1,1,1] ];
			myBlock.state_3_matrix = [ [1],[1],[1],[1],[1] ];
			myBlock.state_4_matrix = [ [1,1,1,1,1] ];
			myBlock.state_1_startIndex = [0,4];
			myBlock.state_2_startIndex = [1,3];
			myBlock.state_3_startIndex = [0,5];
			myBlock.state_4_startIndex = [2,3];

		break;
		
		case 'j' :
		
			myBlock.tileImage = 'TILE_TEAL.png';
			myBlock.state_1_matrix = [ [0,1],[0,1],[1,1] ];
			myBlock.state_2_matrix = [ [1,0,0],[1,1,1] ];
			myBlock.state_3_matrix = [ [1,1],[1,0],[1,0] ];
			myBlock.state_4_matrix = [ [1,1,1],[0,0,1] ];
			myBlock.state_1_startIndex = [0,3];
			myBlock.state_2_startIndex = [0,3];
			myBlock.state_3_startIndex = [0,4];
			myBlock.state_4_startIndex = [1,3];
			
		break;
		
		case 'l' :
		
			myBlock.tileImage = 'TILE_BLUE.png';
			myBlock.state_1_matrix = [ [1,0],[1,0],[1,1] ];
			myBlock.state_2_matrix = [ [1,1,1],[1,0,0] ];
			myBlock.state_3_matrix = [ [1,1],[0,1],[0,1] ];
			myBlock.state_4_matrix = [ [0,0,1],[1,1,1] ];
			myBlock.state_1_startIndex = [0,3];
			myBlock.state_2_startIndex = [0,3];
			myBlock.state_3_startIndex = [0,3];
			myBlock.state_4_startIndex = [0,3];
			
		break;
		
		case 'o' :
		
			myBlock.tileImage = 'TILE_YELLOW.png';
			myBlock.state_1_matrix = [ [1,1],[1,1] ];
			myBlock.state_2_matrix = [ [1,1],[1,1] ];
			myBlock.state_3_matrix = [ [1,1],[1,1] ];
			myBlock.state_4_matrix = [ [1,1],[1,1] ];
			myBlock.state_1_startIndex = [0,4];
			myBlock.state_2_startIndex = [0,4];
			myBlock.state_3_startIndex = [0,4];
			myBlock.state_4_startIndex = [0,4];
			
		break;
		
		case 's' :
		
			myBlock.tileImage = 'TILE_PURPLE.png';
			myBlock.state_1_matrix = [ [0,1,1],[1,1,0] ];
			myBlock.state_2_matrix = [ [1,0],[1,1],[0,1] ];
			myBlock.state_3_matrix = [ [0,1,1],[1,1,0] ];
			myBlock.state_4_matrix = [ [1,0],[1,1],[0,1] ];
			myBlock.state_1_startIndex = [1,3];
			myBlock.state_2_startIndex = [0,4];
			myBlock.state_3_startIndex = [1,3];
			myBlock.state_4_startIndex = [0,4];
			
		break;
		
		case 't' :
		
			myBlock.tileImage = 'TILE_RED.png';
			myBlock.state_1_matrix = [ [1,1,1],[0,1,0] ];
			myBlock.state_2_matrix = [ [0,1],[1,1],[0,1] ]
			myBlock.state_3_matrix = [ [0,1,0],[1,1,1] ];
			myBlock.state_4_matrix = [ [1,0],[1,1],[1,0] ];
			myBlock.state_1_startIndex = [1,3];
			myBlock.state_2_startIndex = [0,3];
			myBlock.state_3_startIndex = [0,3];
			myBlock.state_4_startIndex = [0,4];
			
		break;
		
		case 'z' :
		
			myBlock.tileImage = 'TILE_GREEN.png';
			myBlock.state_1_matrix = [ [1,1,0],[0,1,1],];
			myBlock.state_2_matrix = [ [0,1],[1,1],[1,0] ];
			myBlock.state_3_matrix = [ [1,1,0],[0,1,1],];
			myBlock.state_4_matrix = [ [0,1],[1,1],[1,0] ];
			myBlock.state_1_startIndex = [1,3];
			myBlock.state_2_startIndex = [0,4];
			myBlock.state_3_startIndex = [1,3];
			myBlock.state_4_startIndex = [0,4];
			
		break;
		
		default : break;
		
	}
	
	switch (state) {

		case 1 : myBlock.currentMatrix = myBlock.state_1_matrix; myBlock.currentIndex = myBlock.state_1_startIndex; break;
		case 2 : myBlock.currentMatrix = myBlock.state_2_matrix; myBlock.currentIndex = myBlock.state_2_startIndex; break;
		case 3 : myBlock.currentMatrix = myBlock.state_3_matrix; myBlock.currentIndex = myBlock.state_3_startIndex; break;
		case 4 : myBlock.currentMatrix = myBlock.state_4_matrix; myBlock.currentIndex = myBlock.state_4_startIndex; break;
		default : break;
		
	}
	
	myBlock.width = myBlock.currentMatrix[0].length;
	myBlock.height = myBlock.currentMatrix.length;
	
	types = null;
	random = null;
	state = null;
	type = null;
	
	return myBlock;
	
}

function initLineStack() {
	
	var lineStack = [];
	return lineStack;
	
}

function initBoard() {

	var myBoard = [[]];

	// create empty myBoard
	for (var row = 0; row < BOARD_ROWS; row++) {
		
		myBoard[row] = new Array();
		
		for (var col = 0; col < BOARD_COLS; col++) {
			
			myBoard[row][col] = 0;

		}
		
	}
	
	row = null;
	col = null;
	
	return myBoard;
	
}

function checkGameOver(myBlock, myBoard) {
	
	var width = myBlock.width;
	var height = myBlock.height;
	
	var myBoard_row = 0;
	var myBoard_col = 0;
	var block_row = 0;
	var block_col = 0;
	
	for (myBoard_row = myBlock.currentIndex[0]; myBoard_row < (height + myBlock.currentIndex[0]); myBoard_row++) {
		
		for (myBoard_col = myBlock.currentIndex[1]; myBoard_col < (width + myBlock.currentIndex[1]); myBoard_col++) {
			
			try {
				
				if (myBoard[myBoard_row][myBoard_col] != 0 && myBlock[block_row][block_col] == 1) {
				
					return true;

				}

			} catch (error) {
				
				return true;
				
			}
				
			block_col++;
			
		}
		
		block_row++;
		block_col = 0;
		
	}
	
	width = 0;
	height = 0;
	
	myBoard_row = 0;
	myBoard_col = 0;
	block_row = 0;
	block_col = 0;
	
	return false;
	
}

$(document).ready(function() {
	
	var myBlock;
	var myBoard;
	var lineStack;
	
	var score = 0;
	
	var timer = setInterval(function() {

		if (NEW_GAME && GAME_RUNNING) {

			var e = $.Event('keydown');
			e.keyCode = 40;
			e.which = 65;
			$('body').trigger(e);

		}

	}, 800);
	
	$('body').keydown(function(key) {
	
		// press enter to start game
		if (key.keyCode == 13) {
			
			if (GAME_OVER == false) {
			
				if (NEW_GAME == false) {
				
					myBlock = initBlock();
					myBoard = initBoard();
					lineStack = initLineStack();

					myBoard = updateBoard(myBoard, myBlock);

					update(myBlock, myBoard);
					
					NEW_GAME = true;
					GAME_RUNNING = true;
					
					$('#myBoard-info').hide();
					
					$('#info-start-pause').html('<code>Press <strong>ENTER</strong> to pause game</code>');
					
				} else if (GAME_RUNNING) {
					
					GAME_RUNNING = false;
					
					$('#myBoard-info').html('GAME PAUSED');
					$('#myBoard-info').show();
					
					$('#info-start-pause').html('<code>Press <strong>ENTER</strong> to resume game</code>');
					
				} else {
					
					GAME_RUNNING = true;

					$('#myBoard-info').html('GAME PAUSED');
					$('#myBoard-info').hide();
					
					$('#info-start-pause').html('<code>Press <strong>ENTER</strong> to pause game</code>');
					
				}
				
			}

		}
	
		if (key.keyCode == 80) {
			
			if (GAME_RUNNING) {
				
				GAME_RUNNING = false;
				$('#myBoard-info').html('GAME PAUSED');
				$('#myBoard-info').show();
				
			} else {
				
				GAME_RUNNING = true;
				$('#myBoard-info').hide();
				
			}
			
		}
	
		if (GAME_RUNNING) {
	
			switch(key.keyCode) {
				
				// ←
				case 37 :
					myBlock = moveBlock('left', myBlock, myBoard, lineStack);
					myBoard = updateBoard(myBoard, myBlock);
					break;
				
				// ↓
				case 40 :
					
					myBlock = moveBlock('down', myBlock, myBoard, lineStack);
					
					// if block was grounded
					if (myBlock.currentState == 0) {

						myBoard = updateBoard(myBoard, myBlock);
					
						lineStack = checkLines(myBoard, lineStack);
						
						if (lineStack.length > 0) {

							lineStack.sort();
							
							myBoard = removeLines(myBoard, lineStack);
							
							score = updateScore(score, lineStack.length);
							
							$('#thescore > span').text(score);
							
							lineStack = [];
							
						}
						
						myBlock = null;
						myBlock = initBlock(myBlock);
						
						if (checkGameOver(myBlock, myBoard)) {
							
							timer = setGameOver(myBlock, myBoard, timer);
							
						}
						
					}
					
					myBoard = updateBoard(myBoard, myBlock);

					update(myBlock, myBoard);
					
					break;
				
				// →
				case 39 : 
					myBlock = moveBlock('right', myBlock, myBoard, lineStack);
					myBoard = updateBoard(myBoard, myBlock);
					break;

				// rotate left ('A')
				case 65 : 
					myBlock = rotateBlock('left', myBlock, myBoard, lineStack);
					myBoard = updateBoard(myBoard, myBlock);
					break;
				
				// rotate right ('D')
				case 68 : 
					myBlock = rotateBlock('right', myBlock, myBoard, lineStack);
					myBoard = updateBoard(myBoard, myBlock);
					break;

				// spacebar
				case 32 :
				
					while (myBlock.currentState > 0) myBlock = moveBlock('down', myBlock, myBoard, lineStack);

					// if block was grounded
					if (myBlock.currentState == 0) {

						myBoard = updateBoard(myBoard, myBlock);

						lineStack = checkLines(myBoard, lineStack);
						
						if (lineStack.length > 0) {

							lineStack.sort();
							
							myBoard = removeLines(myBoard, lineStack);
							
							score = updateScore(score, lineStack.length);
							
							$('#thescore > span').text(score);
							
							lineStack = [];
							
						}
						
						myBlock = null;
						myBlock = initBlock(myBlock);
						
						if (checkGameOver(myBlock, myBoard)) {
							
							timer = setGameOver(myBlock, myBoard, timer);
							
						}
						
					}

					myBoard = updateBoard(myBoard, myBlock);

					update(myBlock, myBoard);
				
					break;
				
				default : break;
				
			}
			
			update(myBlock, myBoard);
			
		}
		
	});
	
});
