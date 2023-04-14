'use strict'
export const ver = "0.0.1"

const Options = {
  keyboard : true,
  mouse    : true,
  touch    : true,

  // true:キーボード押しっぱなしで文字が連続入力される , false:キーボード押しっぱなしの時に、リピート処理を無くす
  keyboard_repear : false,

  // true: 斜め入力をする , false: 斜め入力をしない
  slanting : true,

  // 画面をスワイプすることで上下左右のカーソル操作ができる機能（スマホ用機能）
  swipe_cursor : true, 

  // swipe_cursor(スワイプカーソル機能)がtrueの時に、カーソル判定スワイプ移動距離(px)
  touchOffset : 30,

  // touch時に画面スクロールイベントなどを防止する
  touchPreventDefault : true,

  // ダブルタップタイミング(ms)
  touchDoubleTapTime : 500,


  // イベント発動で発火するメソッド
  resize_callback     : function(cursor , e){},
  click_callback      : function(cursor , e){},

  cursordown_callback : function(cursor , e){},
  cursorup_callback   : function(cursor , e){},

  keydown_callback    : function(code , e){},
  keyup_callback      : function(code , e){},

  mousedown_callback  : function(e){},
  mousemove_callback  : function(e){},
  mouseup_callback    : function(e){},

  touchstart_callback : function(e){},
  touchmove_callback  : function(cursor , e){},
  touchend_callback   : function(cursor , e){},
}

export class Control{
  constructor(options){
    this.options = this.setOptions(options)
    this.setEvent()
  }

  setOptions(options){
    if(!options){return}
    for(var i in Options){
      options[i] = typeof options[i] !== 'undefined' ? options[i] : Options[i]
    }
    return options
  }

  setEvent(){
    window.addEventListener("resize" , this.resize.bind(this))
    window.addEventListener("click"  , this.click.bind(this))

    if(this.options.keyboard){
      window.addEventListener("keydown" , this.keydown.bind(this))
      window.addEventListener("keyup"   , this.keyup.bind(this))
    }
    if(this.options.mouse){
      window.addEventListener("mousedown" , this.mousedown.bind(this))
      window.addEventListener("mousemove" , this.mousemove.bind(this))
      window.addEventListener("mouseup"   , this.mouseup.bind(this))
    }
    if(this.options.touch){
      window.addEventListener("touchstart" , this.touchstart.bind(this) , {passive : false})
      window.addEventListener("touchmove"  , this.touchmove.bind(this) , {passive : false})
      window.addEventListener("touchend"   , this.touchend.bind(this) , {passive : false})
    }
  }

  // default
  resize(e){
    this.options.resize_callback(e)
  }
  click(e){
    this.options.click_callback(e)
  }

  // Keyboard ----------
  keydown(e){
    if(this.options.keyboard_repear !== true && e.repeat === true){return}
    if(code2cursor(e.keyCode)){
      this.keydownCursor(e)
    }
    else{
      this.keydownKey(e)
    }
  }

  keyup(e){
    if(this.cursorCodes){
      this.cursorNum = this.cursorCodes.indexOf(e.keyCode)
      this.keyupCursor(e)
    }
    if(this.keyCodes){
      this.keyNum = this.keyCodes.indexOf(e.keyCode)
      this.keyupKey(e)
    }
  }

  // Cursor -----
  // 方向カーソル処理
  keydownCursor(e){
    this.cursorCodes = this.cursorCodes || []
    // 同時押し処理
    if(this.cursorCodes.indexOf(e.keyCode) === -1){
      this.cursorCodes.push(e.keyCode)
    }

    // 斜め入力あり
    if(this.options.slanting === true){
      this.options.cursordown_callback(codes2slanting(this.cursorCodes) , e)
    }
    // 斜め入力なし
    else{
      const cursor = code2cursor(this.cursorCodes[0])
      this.options.cursordown_callback(cursor , e)
    }
  }

  // 方向カーソル処理
  keyupCursor(e){
    // 同時押し処理
    if(this.cursorCodes && this.cursorNum !== -1){
      this.cursorCodes.splice(this.cursorNum , 1)
    }
    
    // 斜め入力あり
    if(this.options.slanting === true){
      this.options.cursorup_callback(codes2slanting(this.cursorCodes) , e)
    }
    // 斜め入力なし
    else{
      const cursor = code2cursor(this.cursorCodes[0])
      this.options.cursorup_callback(cursor , e)
    }
  }

  // key -----
  keydownKey(e){
    this.keyCodes = this.keyCodes || []
    // 同時押し処理
    if(this.keyCodes.indexOf(e.keyCode) === -1){
      this.keyCodes.push(e.keyCode)
    }
    const cursor = code2key(this.keyCodes[0])
    this.options.keydown_callback(cursor , e)
  }

  keyupKey(e){
    // 同時押し処理
    if(this.keyCodes && typeof this.keyNum !== -1){
      this.keyCodes.splice(this.keyNum , 1)
    }
    const cursor = code2key(this.keyCodes[0])
    this.options.keyup_callback(cursor , e)
  }

  code2data(keyCode){
    const value = code2value(keyCode)
    return {
      text: value,
      type: ""
    }
  }

  // Mouse ----------
  mousedown(e){
    this.mouseDownFlag = true
    this.options.mousedown_callback(e)
  }
  mousemove(e){
    if(!this.mouseDownFlag){return}
    this.options.mousemove_callback(e)
  }
  mouseup(e){
    this.mouseDownFlag = false
    this.options.mouseup_callback(e)
  }

  // Touch ----------
  touchstart(e){
    // tap-count
    if(this.options.touchDoubleTapTime){
      this.touchTapCount = this.touchTapCount ? this.touchTapCount + 1 : 1;
      if(!this.touchTapFlag){
        this.touchTapFlag = setTimeout(this.touchTap.bind(this) , this.options.touchDoubleTapTime)
      }
    }
    // スワイプで方向処理
    if(this.options.swipe_cursor){
      this.touchPos  = {
        x : e.touches[0].pageX,
        y : e.touches[0].pageY
      }
    }
    this.options.touchstart_callback(e)
  }
  touchmove(e){
    if(this.options.swipe_cursor){
      this.touchSwipeDirection = touchDirection(
        this.touchPos,
        {
          x: e.touches[0].pageX,
          y: e.touches[0].pageY
        },
        this.options.touchOffset,
        this.options.slanting
      );
    }
    this.options.touchmove_callback(this.touchSwipeDirection , e)
    if(this.options.touchPreventDefault){
      e.preventDefault()
    }
  }
  touchend(e){
    this.options.touchend_callback(this.touchSwipeDirection , this.touchTapCount || 1 , e)
    this.touchSwipeDirection = null
  }

  touchTap(){
    this.touchTapCount = 0
    this.touchTapFlag = null
  }


  // lib ----------

  // カーソル入力とキー入力を判別する
  checkControl(keyCode){
    if(keyCode === 37
    || keyCode === 38
    || keyCode === 39
    || keyCode === 40){
      return "cursor"
    }
    else{
      return "key"
    }
  }
}

function touchDirection(cachePos , currentPos , touchOffset , slanting){
  let res = null
  let diff = {
    x : currentPos.x - cachePos.x , 
    y : currentPos.y - cachePos.y
  }
  diff.x = Math.abs(diff.x) >= touchOffset ? diff.x : 0
  diff.y = Math.abs(diff.y) >= touchOffset ? diff.y : 0

  // slanting
  if(slanting){
    if(!diff.x && !diff.y){return ""}
    if(!diff.y){
      return diff.x < 0 ? "left" : "right"
    }
    if(!diff.x){
      return diff.y < 0 ? "up" : "down"
    }
    const row = diff.y < 0 ? "up" : "down"
    const col = diff.x < 0 ? "left" : "right"
    return row +"-"+ col
  }
  // no-slanting
  else{
    if(!diff.x && !diff.y){return ""}
    // x軸とy軸の大きい方を優先する
    if(Math.abs(diff.x) > Math.abs(diff.y)){
      return diff.x < 0 ? "left" : "right"
    }
    else{
      return diff.y < 0 ? "up" : "down"
    }
  }
  return res
}

// ナナメ判定
function codes2slanting(keyCodes){
  if(!keyCodes){
    return null
  }
  if(keyCodes.length === 1){
    return code2cursor(keyCodes[0])
  }
  // up-left
  if((keyCodes[0] === 38 && keyCodes[1] === 37)
  || (keyCodes[0] === 37 && keyCodes[1] === 38)){
    return "up-left";
  }
  // up-right
  if((keyCodes[0] === 38 && keyCodes[1] === 39)
  || (keyCodes[0] === 39 && keyCodes[1] === 38)){
    return "up-right";
  }
  // down-left
  if((keyCodes[0] === 40 && keyCodes[1] === 37)
  || (keyCodes[0] === 37 && keyCodes[1] === 40)){
    return "down-left";
  }
  // down-right
  if((keyCodes[0] === 40 && keyCodes[1] === 39)
  || (keyCodes[0] === 39 && keyCodes[1] === 40)){
    return "down-right";
  }
  return code2cursor(keyCodes[0])
}


function code2type(keyCode){
  const value = code2value(keyCode)
  if(value === "up"
  || value === "down"
  || value === "left"
  || value === "right"){
    return {
      control: value,
      key : null
    }
  }
  else{
    return {
      control : null,
      key : value
    }
  }
}

// Only cursor
function code2cursor(keyCode){
  switch(keyCode){
    case  37: return "left"
    case  38: return "up"
    case  39: return "right"
    case  40: return "down"
    default:null
  }
}

// exclusion cursor
function code2key(keyCode){
  switch(keyCode){
    case   0: return "¥"
    case   8: return "backspace"
    case   9: return "tab"
    case  13: return "return"
    case  16: return "shift"
    case  18: return "option"
    case  32: return "space"
    case  48: return "0"
    case  49: return "1"
    case  50: return "2"
    case  51: return "3"
    case  52: return "4"
    case  53: return "5"
    case  54: return "6"
    case  55: return "7"
    case  56: return "8"
    case  57: return "9"
    case  65: return "a"
    case  66: return "b"
    case  67: return "c"
    case  68: return "d"
    case  69: return "e"
    case  70: return "f"
    case  71: return "g"
    case  72: return "h"
    case  73: return "i"
    case  74: return "j"
    case  75: return "k"
    case  76: return "l"
    case  77: return "m"
    case  78: return "n"
    case  79: return "o"
    case  80: return "p"
    case  81: return "q"
    case  82: return "r"
    case  83: return "s"
    case  84: return "t"
    case  85: return "u"
    case  86: return "v"
    case  87: return "w"
    case  88: return "x"
    case  89: return "y"
    case  90: return "z"
    case  91: return "command"
    case 187: return "^"
    case 189: return "-"
  }
  return null
}

// all keys
function code2value(keyCode){
  let res = code2cursor(keyCode)
  if(res){
    return res
  }
  res = code2key(keyCode)
  return res
}