const canvas = document.getElementById('canvas');
const button_L = document.getElementById('L');
const button_C = document.getElementById('C');
const button_R = document.getElementById('R');
const ctx = canvas.getContext('2d');

//ゲームに使う各プロパティ
const game = {
  counter: 0,
  backGrounds: [],
  bgm1: new Audio('bgm/fieldSong.mp3'),
  bgm2: new Audio('bgm/jump.mp3'),
  bgm3: new Audio('bgm/auto.mp3'),
  bgm4: new Audio('bgm/f1.mp3'),
  bgm5: new Audio('bgm/end.mp3'),
  enemys: [],
  enemyCountdown: 0,
  image: {},
  score: 0,
  hiScore: 0,
  state: 'loading',
  timer: null
};


//画像ファイル名の配列 　※「png」のみ ※
const imageNames = ["frog", "grass", "ground"];

let imageLoadCounter = 0;
for (const imageName of imageNames) {
  const imagePath = `images/${imageName}.png`;
  game.image[imageName] = new Image();
  game.image[imageName].src = imagePath;
  game.image[imageName].onload = () => {
    imageLoadCounter += 1;
    if (imageLoadCounter === imageNames.length) {
      init();
    }
  }
}


//巻物のプレイ範囲の座標
const stageSize = {
  x_start: 70,
  x_end: 590,
  y_start: 75,
  y_end: 257
}


//　値の初期化 → ゲームスタート　の関数
function init() {
  game.bgm1.volume = 0.2;
  game.bgm2.volume = 0.3;
  game.bgm3.volume = 0.6;
  game.bgm4.volume = 0.3;
  game.bgm5.volume = 0.6;
  game.bgm1.loop = true;
  game.counter = 0;
  game.enemys = [];
  game.enemyCountdown = 0;
  game.score = 0;
  game.state = 'init';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  createFrog();
  drawFrog();
  createBackGround();
  drawBackGrounds();
  ctx.fillStyle = 'green';
  ctx.font = '38px Impact';
  ctx.fillText(`KAERU BIKE!`, 300, 150);
  ctx.fillStyle = 'black';
  ctx.font = '16px Impact';
  ctx.fillText(`Press  Space/Jump  key to start.`, 300, 180);
  ctx.fillStyle = 'red';
  ctx.font = '14px sans-serif';
  ctx.fillText(`🐸 右に行くほど高得点！`, 300, 210);
};

function start() {
  game.state = 'gaming';
  game.bgm1.play();
  game.timer = setInterval(ticker, 30);
}

function ticker() {
  // 画面クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (game.counter % 10 === 0) {
    createBackGround();
  }

  //障害物生成
  if (game.enemyCountdown < 0) {
    if (Math.floor(Math.random() * (100 - game.score / 100)) === 0) {
      createGrass();
      game.enemyCountdown = 60;
    }
  }

  // キャラクターの移動
  moveFrog(); // かえるの移動
  moveGrass(); //切り株の移動
  moveBackGrounds(); // 背景の移動


  //描画
  drawBackGrounds(); // 背景の描画
  drawFrog(); // かえるの描画
  drawGrass(); //切株の描画
  drawScore(); // スコアの描画

  //あたり判定
  hitCheck();

  // カウンターの更新
  game.score += Math.ceil(game.frog.x / 100);
  if (game.score > game.hiScore) {
    game.hiScore = game.score;
  }
  game.counter = (game.counter + 1) % 1000000;
  game.enemyCountdown -= 1;
}



/************************
 * キー操作
 ***********************/
document.onkeydown = e => {

  if (e.key === ' ' && game.state === 'init') {
    start();
  }

  if (e.key === " " && game.frog.moveY === 0 && game.state === 'gaming') {
    game.frog.moveY = -12;
    game.bgm2.play();
  }
  if (e.key === 'ArrowRight') {
    game.bgm3.play();
    game.frog.x += 3;
    if (game.frog.x > 605) {
      game.frog.x = 605;
    }
  }
  if (e.key === 'ArrowLeft') {
    game.bgm3.play();
    game.frog.x -= 3;
    if (game.frog.x < 152) {
      game.frog.x = 152;
    }
  }
  if (e.key === 'Enter' && game.state === 'gameover') {
    init();
  }
}


function click_C() {
  if (game.state === 'init') {
    start();
  }

  if (game.frog.moveY === 0 && game.state === 'gaming') {
    game.frog.moveY = -12;
    game.bgm2.play();
  }

  if (game.state === 'gameover') {
    init();
  }
}

function click_L() {
  if (game.state === 'gaming') {
    game.bgm3.play();
    game.frog.x -= 3;
    if (game.frog.x < 152) {
      game.frog.x = 152;
    }
  }

}

function click_R() {
  if (game.state === 'gaming') {
    game.bgm3.play();
    game.frog.x += 3;
    if (game.frog.x > 605) {
      game.frog.x = 605;
    }
  }
}




/**********************************************************
 * 🐸
**********************************************************/

//描画スタート位置調整用
const positionControl_X = 90;
const positionControl_Y = 6;


function createFrog() {
  game.frog = {
    x: stageSize.x_start + positionControl_X + game.image.frog.width / 2,
    y: stageSize.y_end - positionControl_Y - game.image.frog.height / 2,
    moveY: -1,
    width: game.image.frog.width,
    height: game.image.frog.height,
    image: game.image.frog
  }
}

function moveFrog() {
  game.frog.y += game.frog.moveY;
  if (game.frog.y >= stageSize.y_end - positionControl_Y - game.frog.height / 2) {
    game.frog.y = stageSize.y_end - positionControl_Y - game.image.frog.height / 2;
    game.frog.moveY = 0;
  } else {
    game.frog.moveY += 1;
  }
}

let anime = 0;　//バイクのY軸のブレの値を入れる変数
function drawFrog() {
  if(game.state === 'init'){
    ctx.save();
    ctx.rotate(-10 * Math.PI / 180);
    ctx.drawImage(game.image.frog,
      game.frog.x - game.frog.width / 2 -40,
      game.frog.y - game.frog.height / 2 - anime +10);
    ctx.restore();
  }else{
    anime = game.counter % 2;
    ctx.drawImage(game.image.frog,
      game.frog.x - game.frog.width / 2,
      game.frog.y - game.frog.height / 2 - anime);
  }
}




/***********************************************
 * 障害物
 ***********************************************/
function createGrass() {
  game.bgm4.play();
  game.enemys.push({
    x: stageSize.x_end + game.image.grass.width / 2,
    y: stageSize.y_end - positionControl_Y - game.image.grass.height / 2,
    width: game.image.grass.width,
    height: game.image.grass.height,
    moveX: -12,
    image: game.image.grass
  })
}

function moveGrass() {
  for (const enemy of game.enemys) {
    enemy.x += enemy.moveX;
  }
  game.enemys = game.enemys.filter(e => e.x > e.width / 2 + stageSize.x_start);
}

function drawGrass() {
  for (const e of game.enemys) {
    ctx.drawImage(e.image, e.x - e.width / 2, e.y - e.height / 2);
  }
}



/***************************************
 * スコア表示
 **************************************/
function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '16px Impact';
  ctx.fillText(`SCORE: ${game.score}`, stageSize.x_start + 200, stageSize.y_start + 20);
  ctx.fillText(`HI-SCORE: ${game.hiScore}`, stageSize.x_start + 320, stageSize.y_start + 20);
}



/***************************************
 * 地面関係
 **************************************/
function createBackGround() {
  game.backGrounds = [];
  for (let x = stageSize.x_start; x <= stageSize.x_end; x += game.image.ground.width) {
    game.backGrounds.push({
      x: x + game.image.ground.width,
      y: stageSize.y_end - game.image.ground.height,
      width: game.image.ground.width,
      moveX: - game.image.ground.width / 10,
      image: game.image.ground
    });
  }
}
function moveBackGrounds() {
  for (const backGround of game.backGrounds) {
    backGround.x += backGround.moveX;
  }
}

function drawBackGrounds() {
  for (const g of game.backGrounds) {
    ctx.drawImage(g.image, g.x, g.y);
  }
}


/***************************************
 * 当り判定
 **************************************/

function hitCheck() {
  for (const e of game.enemys) {
    if (
      Math.abs(game.frog.x - e.x) < game.frog.width * 0.8 / 2 + e.width * 0.9 / 2 &&
      Math.abs(game.frog.y - e.y) < game.frog.height * 0.5 / 2 + e.height * 0.9 / 2
    ) {
      game.bgm5.play()
      game.state = 'gameover';
      game.bgm1.pause();
      ctx.font = "bold 50px Impact";
      ctx.fillText("Game Over", stageSize.x_start + 190, stageSize.y_start + 100);
      ctx.font = "18px Impact";
      ctx.fillStyle = "red";
      ctx.fillText(`Press   Enter/Jump key   to ReStart`, stageSize.x_start + 350, stageSize.y_end - 15);
      clearInterval(game.timer);
    }
  }
}
