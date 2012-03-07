(function() {
  var TTT = window.TTT = {};

  var state = [
      null, null, null,
      null, null, null,
      null, null, null
  ];

  var wins = [
    [1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 1, 0, 1, 0, 1, 0, 0]
  ];

  function resetState() {
    state = [
      null, null, null,
      null, null, null,
      null, null, null
    ];
  }

  function drawLine(ctx, coords, color, width) {
    if (width) ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(coords[0], coords[1]);
    ctx.lineTo(coords[2], coords[3]);
    if (color) ctx.strokeStyle = color;
    ctx.stroke();
  }

  function drawBoard(c) {
    var ctx = c.getContext('2d');
    var side = c.width;
    var third = c.width / 3;
    var lines = [
      [third, 0, third, side],
      [(third * 2), 0, (third * 2), side],
      [0, third, side, third],
      [0, (third * 2), side, (third * 2)]
    ];
    for (var i = 0, l = lines.length; i < l; i++) {
      drawLine(ctx, lines[i], '#ffffff', 4);
    }
    if (state.filter(notNull).length) {
      var squares = getSquares(side);
      state.forEach(function(m, i) {
	if (m === 'X') drawX(ctx, squares[i]);
	if (m === 'O') drawO(ctx, squares[i]);
      });
    }
  }

  function drawX(ctx, sq, color) {
    var s = sq[2] - sq[0];
    var d = s * 0.2;
    var l = [
      [sq[0]+d, sq[1]+d, sq[2]-d, sq[3]-d],
      [sq[0]+d, sq[3]-d, sq[2]-d, sq[1]+d]
    ];
    l.forEach(function(line) {
      drawLine(ctx, line, (color || '#bb2200'), 8);
    });
  }

  function drawO(ctx, sq, color) {
    var s = sq[2] - sq[0];
    var x = sq[0] + (s/2);
    var y = sq[1] + (s/2);
    ctx.beginPath();
    ctx.strokeStyle = color || '#22bb00';
    ctx.lineWidth = 8;
    ctx.arc(x, y, ((s/2)*0.6), 0, (Math.PI*2), 0)
    ctx.stroke();
  }

  function getTotalMoves() {
    return state.filter(function(s) {
      if (s === 'X' || s === 'O') return true;
    }).length;
  }

  function sameArray(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0, l = a.length; i < l; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function gameWon() {
    var game;
    var o = state.map(function(s) { return (s === 'O') ? 1 : 0; });
    var x = state.map(function(s) { return (s === 'X') ? 1 : 0; });
    wins.forEach(function(w) {
      if (sameArray(w, o)) {
	game = {winner: 'O', win: w};
      } else if (sameArray(w, x)) {
	game = {winner: 'X', win: w};
      }
    });
    return game;
  }

  function showGranny(c, ctx) {
    var tf = document.getElementById('tf');
    ctx.drawImage(tf, 0, 0, c.width, c.height);
  }

  function catsGame() {
    return (state.filter(notNull).length === 9);
  }

  function resetCanvas(c) {
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
  }

  function doMove(ctx, squares, s) {
    var moves = getTotalMoves();
    if (moves === 0 || moves % 2 === 0) {
      state[s] = 'O';
      drawO(ctx, squares[s]);
    } else {
      state[s] = 'X';
      drawX(ctx, squares[s]);
    }
  }

  function restartGame(c) {
    resetState();
    resetCanvas(c);
    startGame(c);
  }

  function concludeGame(c) {
    setTimeout(function() {
      document.body.onclick = function(e) {
	restartGame(c);
	document.body.onclick = null;
      }
    }, 10);
  }

  function showWinner(ctx, won, squares) {
    var draw = (won.winner === 'O') ? drawO : drawX;
    won.win.forEach(function(sq, i) {
      if (sq === 1) draw(ctx, squares[i], '#ffffff');
    });
  }
    
  function checkBoard(c, ctx, squares) {
    var won = gameWon();
    var cats = catsGame();
    if (won) {
      showWinner(ctx, won, squares);
      concludeGame(c);
    } else if (cats) {
      showGranny(c, ctx);
      concludeGame(c);
    }
  }

  function gameLoop(e) {
    var c = e.target
    var squares = getSquares(c.width);
    var s = whichSquare(e.target, getCoordinates(e), squares);
    var ctx = c.getContext('2d');
      
    if (!state[s]) {
      doMove(ctx, squares, s);
      checkBoard(c, ctx, squares);
    }
  }

  function checkForState() {
    var oldState = window.localStorage.getItem('state');
    if (oldState) {
      state = JSON.parse(oldState);
      window.localStorage.clear();
    }
  }

  function startGame(c) {
    checkForState();
    drawBoard(c);
    if (typeof c.onclick !== 'function') c.onclick = gameLoop;
  }

  function getCoordinates(e) {
    return {
      x: e.offsetX,
      y: e.offsetY
    };
  }

  function getSquares(side) {
    var third = side / 3;
    var squares = [];
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
	var x1 = (j*third);
	var y1 = (i*third);
	var x2 = ((j+1)*third);
	var y2 = ((i+1)*third);
	squares.push([x1, y1, x2, y2]);
      }
    }
    return squares;
  }

  function whichSquare(c, p, squares) {
    var side = c.width;
    return squares.map(function(s) {
      if (p.x >= s[0] && p.x <= s[2] &&
	  p.y >= s[1] && p.y <= s[3]) {
	return true;
      }
    }).indexOf(true);
  }
    
  function hideAddress() {
    var h = document.documentElement.clientHeight, w = window.innerHeight;
    if (h <= w) document.body.style.height = (w + 80) + "px";
    !window.location.hash && scrollTo(0, 1);
  }

  function stretchCanvas(c) {
    var h = document.documentElement.clientHeight;
    var w = document.documentElement.clientWidth;
    var l = Math.min(h, w);
    c.setAttribute('height', l);
    c.setAttribute('width', l);
  }
  
  function centerCanvas(c) {
    var h = ((window.innerHeight - c.height) / 2)+'px';
    var w = ((window.innerWidth - c.width) / 2)+'px';
    c.style.top = h;
    c.style.left = w;
  }

  function placeCanvas(c) {
    stretchCanvas(c);
    centerCanvas(c);
  }

  function notNull(m) {
    if (m !== null) return true;
  }
    
  function reorientBoard() {
    if (state.filter(notNull).length) {
      window.localStorage.setItem('state', JSON.stringify(state));
    }
    var h = window.innerHeight; var w = window.innerWidth;
    var i = setInterval(function() {
      if (window.innerHeight !== h) {
	clearInterval(i);
	start();
      }
    }, 100);
  }

  function start() {
    var c = document.getElementById('gameboard');
    hideAddress();
    placeCanvas(c);
    startGame(c);
  }

  TTT.start = start;
  TTT.reorient = reorientBoard;


}());