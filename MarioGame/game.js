kaboom({ 
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    clearColor: [0, 0, 0, 1],
  });
  // Identificadores de velocidad
  const MOVE_SPEED = 200
  const JUMP_FORCE = 360
  const BIG_JUMP_FORCE = 500
  let CURRENT_JUMP_FORCE = JUMP_FORCE
  let isJumping = true //camara en salto
  const FALL_DEATH = 400 
  
  
  
  // Lógica del juego
  
  
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
  
  
  // Escena del juego
  
  scene("game", ({ level, score }) => {
    layers(['bg','obj','ui'], 'obj')
  
    const maps = [ //mapa 1
      [ 
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '    %   =*=%=                     ',
        '                                  ',
        '                        -+        ',
        '                ^   ^   ()        ',
        '==========================   =====',
      ],
      [ //mapa 2
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
      [ //mapa 3
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
    //niveles, mapas
    const gameLevel = addLevel(maps[level], levelCfg);
    //puntaje
    const scoreLabel = add([
      text(score),
      pos(30, 6),
      layer('ui'),
      {
        value: score,
      }
    ])
  
    add([text('level ' + parseInt(level +  1)), pos(50,6)])
  
  
    //Mario grande
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
    
   //jugador
    const player = add([
      sprite('mario'), solid(),
      pos(30, 0),
      body(),
      big(),
      origin('bot'),
    ])
    //movimiento hongo
    action('mushroom', (m)=>{
      m.move(35,0)
    })
    // golpear bloque con la cabeza
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
    //chocar hongo
    player.collides('mushroom', (m)=>{
      destroy(m)
      player.biggify(6)
    })
    //chocar moneda
    player.collides('coin', (c) => {
      destroy(c)
      scoreLabel.value++;
      scoreLabel.text = scoreLabel.value
    })
   //movimiento enemigo
    const ENEMY_SPEED = 30
    
    action('dangerous', (d) =>{
      d.move(-ENEMY_SPEED,0)
    })
  
    // chocar hongo malvado
    player.collides('dangerous', (d) =>{
      if (isJumping){
        destroy(d)
      } else {
      go('lose', { score: scoreLabel.value})
      }
    })
  
    //caer del mapa y camara movimiento
  
    player.action(() => {
      camPos(player.pos)
      if (player.pos.y >= FALL_DEATH) {
        go ('lose', { score: scoreLabel.value})
      }
    })
  
    //pasar de nivel 
  
    player.collides('pipe', () =>{
      keyPress('down', () => {
        go('game', { 
          level: (level + 1) % maps.length, //esto ultimo para que vuelva al nivel inicial
          score: scoreLabel.value
        })
      })
    })
  
  
    //teclas para moverse
    keyDown('left', () => {
      player.move(-MOVE_SPEED, 0)
    })
  
    keyDown('right', () => {
      player.move(MOVE_SPEED, 0)
    })
  
    // jugador en plataforma
    player.action(() => {
      if (player.grounded()) {
        isJumping = false
      }
    })
  
    keyPress('space', () =>{
      if(player.grounded()){
        isJumping = true
        player.jump(CURRENT_JUMP_FORCE)
      }
    })
  
  
  })
  
  //al perder
  scene('lose', ({ score }) =>{
    add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)])
  })

  
  
  start("game", { level: 0, score: 1})
