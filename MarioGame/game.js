// Inicialización de Kaboom
kaboom({ 
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0, 0, 0, 1],
  });

 // Constantes de velocidad y configuración del salto
  const MOVE_SPEED = 200
  const JUMP_FORCE = 360
  const BIG_JUMP_FORCE = 500
  let CURRENT_JUMP_FORCE = JUMP_FORCE
  let isJumping = true //camara en salto
  const FALL_DEATH = 400 
  
  // Carga de sprites
  loadRoot('img/')
  loadSprite( 'coin','coin.png')
  loadSprite('evil-shroom', 'evil-shroom.png')
  loadSprite('brick', 'brick.png')
  loadSprite('block', 'block.png')
  loadSprite('mario', 'mario.png')
  loadSprite('mushroom', 'mushroom.png')
  loadSprite('surprise', 'surprise.png')
  loadSprite('unboxed', 'unboxed.png')
  loadSprite('pipe-top-left', 'pipe-top-left.png')
  loadSprite('pipe-top-right', 'pipe-top-right.png')
  loadSprite('pipe-bottom-left', 'pipe-bottom-left.png')
  loadSprite('pipe-bottom-right', 'pipe-bottom-right.png')
  loadSprite('blue-block', 'blue-block.png')
  loadSprite('blue-brick', 'blue-brick.png')
  loadSprite('blue-steel', 'blue-steel.png')
  loadSprite('blue-evil-shroom', 'blue-evil-shroom.png')
  loadSprite('blue-surprise', 'blue-surprise.png')
  loadSprite('arrow-right', 'arrow-right.png')
  loadSprite('arrow-left', 'arrow-left.png')
  loadSprite('arrow-up', 'arrow-up.png')
  loadSprite('arrow-down', 'arrow-down.png')
  
  
  // Escena del juego
  scene("game", ({ level, score }) => {
    layers(['bg','obj','ui'], 'obj')

    // Definición de mapas (niveles del juego)
    // Cada mapa es un array de cadenas que representa una cuadrícula de tiles
    const maps = [ //Nivel 01
      [ 
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '    %   =*=%=                    =',
        '                                  ',
        '                        -+        ',
        '                ^   ^   ()        ',
        '==========================   =====',
      ],
      [ //Nivel 02
        '£                                                               $$$                              £',
        '£                                                                                                £',
        '£                                                              =====                             £',
        '£                             %                                         $                        £',
        '£                                                                     ====                       £',
        '£                   %*%%%%%                               =%=                 ===                £',
        '£                                                                 =====                          £',
        '£                                                =*===                                           £',
        '£                      x x x     x  x                                                       -+   £',
        '£              z     x x x x     x  x                                           z           ()   £',
        '!!!!!!!!!!!!!!!!!!!!!!!!!!!!   !!!!!!!!!!!!    !!!!!!!!!!    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
      ],
      [ ////Nivel 03
        '                                                                                                   ',
        '                         $$$$                                                             =        ',
        '                        ====                                                              =        ',
        '                 $                                               $$$$                     =        ',
        '              $     ===     $                             ====                        =   =        ',
        '                              $                                                     ===   =        ',
        '    %   =*=%=              =====                ====                               ====   =        ',
        '                                      == ====                                     =====   =        ',
        '                                                                          =%=    ======   =      -+',
        '                    ^             ^                             ^   ^   ^       =======   =      ()',
        '===========================================================  =======================================',
      ],
    ]
  
    // Configuración de cada nivel
    // Define cómo interpretar cada carácter en el mapa
    const levelCfg = {
      width: 20,
      height: 20,
      '=': [sprite('block'), solid()],
      '$': [sprite('coin'), 'coin'],
      '%': [sprite('surprise'), solid(), 'coin-surprise'],
      '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
      '}': [sprite('unboxed'), solid()],
      '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
      ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
      '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
      '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
      '^': [sprite('evil-shroom'), solid(), 'dangerous'],
      '#': [sprite('mushroom'), solid(), 'mushroom', body()],
      '!': [sprite('blue-block'), solid(), 'blue-block', scale(0.5)],
      '£': [sprite('blue-brick'), solid(), scale(0.5)],
      'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],   
      '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
      'x': [sprite('blue-steel'), solid(), scale(0.5)], 
  
    }
    
    
    // Creación del nivel con el primer mapa
    const gameLevel = addLevel(maps[level], levelCfg);
    
    // Etiquetas de puntaje y nivel
    const scoreLabel = add([
      text(score),
      pos(30, 6),
      layer('ui'),
      {
        value: score,
      }
    ])
    add([text('level ' + parseInt(level +  1)), pos(50,6)])
  
    // Definición de función para hacer al jugador grande o pequeño
    function big() {
      let timer = 0
      let isBig = false
      return {
        update() {
          if (isBig) {
            CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
            timer -= dt()
            if (timer <= 0) {
              this.smallify()
            }
          }
        },
        isBig() {
          return isBig
        },
        smallify() {
          this.scale = vec2(1)
          CURRENT_JUMP_FORCE = JUMP_FORCE
          timer = 0
          isBig = false
        },
        biggify(time) {
          this.scale = vec2(2)
          CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
          timer = time
          isBig = true     
        }
      }
    }
    
   // Jugador
    const player = add([
      sprite('mario'), solid(),
      pos(30, 0),
      body(),
      big(),
      origin('bot'),
    ])

    const buttons = {
      up: add([
        sprite('arrow-up'), solid(),
        pos(50, height() - 420),
        layer('ui'),
        origin('center'),
        color(1, 1, 1),
      ]),
      down: add([
        sprite('arrow-down'), solid(),
        pos(50, height() - 380),
        layer('ui'),
        origin('center'),
        color(1, 1, 1),
      ]),
      left: add([
        sprite('arrow-left'), solid(),
        pos(20, height() - 400),
        layer('ui'),
        origin('center'),
        color(1, 1, 1),
      ]),
      right: add([
        sprite('arrow-right'), solid(),
        pos(80, height() - 400),
        layer('ui'),
        origin('center'),
        color(1, 1, 1),
      ]),
    };
  

    // Manejar eventos de clic con collides y mouseClick
    for (const direction in buttons) {
      buttons[direction].clicks(() => {
        movePlayer(direction);
      });
    }
  
    function movePlayer(direction) {
      switch (direction) {
        case 'up':
          player.move(360, -MOVE_SPEED);
          break;
        case 'down':
          player.move(0, MOVE_SPEED);
          break;
        case 'left':
          player.move(-MOVE_SPEED, 0);
          break;
        case 'right':
          player.move(MOVE_SPEED, 0);
          break;
      }
    }

    //Hongo
    action('mushroom', (m)=>{
      m.move(35,0)
    })

    //Golpear bloque con salto
    player.on("headbump", (obj) => {
      if (obj.is('coin-surprise')){
        gameLevel.spawn('$', obj.gridPos.sub(0, 1))
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0,0))
      }
      if (obj.is('mushroom-surprise')){
        gameLevel.spawn('#', obj.gridPos.sub(0, 1))
        destroy(obj)
        gameLevel.spawn('}', obj.gridPos.sub(0,0))
      }
    })

    //Saltar hongo
    player.collides('mushroom', (m)=>{
      destroy(m)
      player.biggify(6)
    })

    //Obtener moneda
    player.collides('coin', (c) => {
      destroy(c)
      scoreLabel.value++;
      scoreLabel.text = scoreLabel.value
    })

   //Movimiento enemigo
    const ENEMY_SPEED = 30
    
    action('dangerous', (d) =>{
      d.move(-ENEMY_SPEED,0)
    })
  
    //Saltar hongo malvado
    player.collides('dangerous', (d) =>{
      if (isJumping){
        destroy(d)
      } else {
      go('lose', { score: scoreLabel.value})
      }
    })
  
    // Acción para que el jugador caiga del mapa y actualización de la posición de la cámara
    player.action(() => {
      camPos(player.pos)
      if (player.pos.y >= FALL_DEATH) {
        go ('lose', { score: scoreLabel.value})
      }
    })
    
    // Colisión con tubería para pasar de nivel
    player.collides('pipe', () =>{
      keyPress('down', () => {
        go('game', { 
          level: (level + 1) % maps.length, //Reinicia al nivel inicial
          score: scoreLabel.value
        })
      })
    })
  
    // Teclas para mover al jugador
    keyDown('left', () => {
      player.move(-MOVE_SPEED, 0)
    })
  
    keyDown('right', () => {
      player.move(MOVE_SPEED, 0)
    })
  
    // Acción para detectar si el jugador está en una plataforma
    player.action(() => {
      if (player.grounded()) {
        isJumping = false
      }
    })

    // Salto del jugador al presionar la tecla de espacio
    keyPress('space', () =>{
      if(player.grounded()){
        isJumping = true
        player.jump(CURRENT_JUMP_FORCE)
      }
    })
  
  
  })
  
  // Escena al perder
  scene('lose', ({ score }) =>{
    add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)])
  })

  
  // Inicio del juego en la escena 'game' con nivel 0 y puntaje inicial 1
  start("game", { level: 0, score: 1})
