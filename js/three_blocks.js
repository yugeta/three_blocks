import { Control } from './control.js'
import { Css }     from './css.js'
import { Ajax }    from './ajax.js'

/**
 * ・要素に対して初期設定を行う
 * ・コントローラ設定
 */
export class ThreeBlocks{
  constructor(options){
    if(!options || !options.target){return}
    this.options = options || {}
    this.question_num = 0
    this.load_questions()
  }

  get target(){
    return this.options.target
  }

  get area_rect(){
    return this.options.target.getBoundingClientRect()
  }
  get size_piece(){
    const css = new Css()
    const size_area = this.area_rect.width
    const count_lattice = css.search_value('.three-blocks' , '--count-lattice')
    return ~~(Number(size_area) / Number(count_lattice))
  }

  get elm_question(){
    return document.querySelector(`.three-blocks .question`)
  }

  get count_pieces(){
    return new Css().search_value('.three-blocks' , '--count-lattice')
  }

  load_questions(){
    new Ajax({
      url : 'data/questions.json',
      success : this.loaded_questions.bind(this)
    })
  }
  loaded_questions(e){
    this.question_datas = JSON.parse(e.data)
    this.init()
  }

  init(){
    this.add_question()
    this.add_table()
    this.add_button()
    this.add_blocks()
    this.set_control()
    this.view_question()
  }

  add_table(){
    const separate = this.count_pieces
    const table = document.createElement('table')
    for(let i=0; i<separate; i++){
      const tr = document.createElement('tr')
      table.appendChild(tr)
      for(let j=0; j<separate; j++){
        const td = document.createElement('td')
        tr.appendChild(td)
      }
    }
    this.options.target.appendChild(table)
  }
  add_question(){
    const div = document.createElement('div')
    div.className = 'question'
    this.options.target.appendChild(div)
  }
  add_button(){
    const btn = document.createElement('button')
    btn.className = 'answer'
    btn.textContent = 'Answer'
    this.options.target.appendChild(btn)
    btn.addEventListener('click' , this.click_answer.bind(this))
  }

  add_blocks(){
    for(let i=0; i<this.question_datas.block_pieces.length; i++){
      this.add_block(i)
    }
  }

  // ブロックの作成 + 配置
  add_block(num){
    const block = document.createElement('div')
    block.classList.add('block')
    block.setAttribute('data-block-num' , num)
    block.setAttribute('data-rotate' , 0)
    this.target.appendChild(block)
    this.set_block_piece(block)
    const x = num * this.size_piece
    const y = num * this.size_piece
    block.style.setProperty('left' , `${x}px`,'')
    block.style.setProperty('top'  , `${y}px`,'')
    this.current_map = {
      x : x,
      y : y,
    }
  }

  // ブロク内のピース作成+配置
  set_block_piece(block){
    const num    = Number(block.getAttribute('data-block-num'))
    const rotate = Number(block.getAttribute('data-rotate') || 0)
    const data   = this.rotate_block_piece(num,rotate)
    if(!data){return}
    // 段
    for(let i=0; i<data.length; i++){
      const step = document.createElement('div')
      step.className = 'step'
      for(let j=0; j<data[i].length; j++){
        const piece = document.createElement('div')
        piece.className = 'piece'
        piece.setAttribute('data-bit' , data[i][j])
        step.appendChild(piece)
      }
      block.appendChild(step)
    }
  }
  del_block_piece(block){
    block.innerHTML = ''
  }
  rotate_block_piece(num , rotate){
    const new_data = [],
      data = this.question_datas.block_pieces[num].map
    let x=0, y=0

    switch(rotate){
      case 90:
        for(let i=data.length-1; i>=0; i--){
          for(let j=0; j<data[i].length; j++){
            new_data[j] = new_data[j] || []
            new_data[j].push(data[i][j])
          }
        }
        return new_data

      case 180:
        for(let i=data.length-1; i>=0; i--){
          for(let j=data[i].length-1; j>=0; j--){
            new_data[data.length-1 - i] = new_data[data.length-1 - i] || []
            new_data[data.length-1 - i].push(data[i][j])
          }
        }
        return new_data

      case 270:
        for(let i=data.length-1; i>=0; i--){
          for(let j=data[i].length-1; j>=0; j--){
            new_data[data[i].length-1 - j] = new_data[data[i].length-1 - j] || []
            new_data[data[i].length-1 - j].unshift(data[i][j])
          }
        }
        return new_data

      default:
        return data
    }
  }

  set_control(){
    new Control({
      slanting : false, // 斜め入力なし
      resize_callback     : this.resize.bind(this),
      click_callback      : this.click.bind(this),
      cursordown_callback : this.cursordown.bind(this),
      cursorup_callback   : this.cursorup.bind(this),
      keydown_callback    : this.keydown.bind(this),
      keyup_callback      : this.keyup.bind(this),
      mousedown_callback  : this.mousedown.bind(this),
      mousemove_callback  : this.mousemove.bind(this),
      mouseup_callback    : this.mouseup.bind(this),
      touchstart_callback : this.touchstart.bind(this),
      touchmove_callback  : this.touchmove.bind(this),
      touchend_callback   : this.touchend.bind(this),
    })
  }
  resize(e){

  }
  click(e){
    // console.log(e)
  }
  cursordown(e){

  }
  cursorup(e){

  }
  keydown(e){

  }
  keyup(e){

  }

  /* PC-mouse */
  mousedown(e){
    const target = e.target.closest('.block[data-block-num]')
    if(!target){return}
    const current_pos = {
      x  : target.offsetLeft,
      y  : target.offsetTop,
    }
    const map = this.get_near_map(current_pos)
    this.block_data = {
      target : target,
      x   : current_pos.x,
      y   : current_pos.y,
      w   : target.scrollWidth,
      h   : target.scrollHeight,
      mx  : e.pageX,
      my  : e.pageY,
      mx2 : e.pageX,
      my2 : e.pageY,
      move_map    : map,
      time : (+new Date()),
    }
    target.setAttribute('data-status','active')
    this.options.target.setAttribute('data-status' , 'active')
  }
  mousemove(e){
    if(!this.block_data){return}
    this.block_data.mx2 = e.pageX
    this.block_data.my2 = e.pageY
    const diff_pos = {
      x : e.pageX - this.block_data.mx,
      y : e.pageY - this.block_data.my,
    }
    const pos = this.piece_pos_limit({
      x : this.block_data.x + diff_pos.x,
      y : this.block_data.y + diff_pos.y,
    })
    this.block_data.target.style.setProperty('left' , `${pos.x}px`, '')
    this.block_data.target.style.setProperty('top'  , `${pos.y}px`, '')
    this.block_data.move = true
    this.block_data.move_map = this.get_near_map(pos)
  }
  mouseup(e){
    if(!this.block_data){return}
    this.block_snap()

    if(this.check_rotate()){
      this.block_rotate()
    }
    this.current_map = this.block_data.move_map
    this.block_data.target.removeAttribute('data-status')
    this.options.target.removeAttribute('data-status')
    delete this.block_data
  }

  /* Smartphone-touch */
  touchstart(e){

  }
  touchmove(e){

  }
  touchend(e){

  }

  check_rotate(){
    if((+new Date()) - this.block_data.time > 200){
      return false
    }
    const diff = {
      x : Math.abs(this.block_data.mx - this.block_data.mx2),
      y : Math.abs(this.block_data.my - this.block_data.my2),
    }
    if(diff.x < 4
    && diff.y < 4
    && this.current_map.x === this.block_data.move_map.x
    && this.current_map.y === this.block_data.move_map.y){
      return true
    }
  }

  piece_pos_limit(pos){
    return pos
  }

  /* Block */
  // 一番近いブロックにスナップさせる処理
  block_snap(){
    if(!this.block_data){return}
    if(this.block_data.mx2 < 0
    || this.block_data.my2 < 0){
      return
    }
    const current_pos = {
      x : this.block_data.target.offsetLeft,
      y : this.block_data.target.offsetTop,
    }
    const new_pos = this.get_map_near_block(current_pos)
    this.block_data.target.style.setProperty('left' , `${new_pos.x}px`, '')
    this.block_data.target.style.setProperty('top'  , `${new_pos.y}px`, '')
  }
  // 左上座標で調査
  get_map_near_block(current_pos){
    const new_pos = this.get_near_map(current_pos)

    return new_pos
  }

  // rotate
  block_rotate(){
    const elm = this.block_data.target
    let rotate = Number(elm.getAttribute('data-rotate') || 0)
    rotate += 90
    rotate = rotate < 360 ? rotate : 0
    this.block_data.target.setAttribute('data-rotate' , rotate)
    this.del_block_piece(this.block_data.target)
    this.set_block_piece(this.block_data.target)
  }

  get_near_map(pos){
    return {
      x : ~~((pos.x + (this.size_piece/2)) / this.size_piece) * this.size_piece,
      y : ~~((pos.y + (this.size_piece/2)) / this.size_piece) * this.size_piece,
    }
  }

  view_question(){
    const num = this.question_num
    const question_items = this.question_datas.questions[num]
    if(!question_items || !question_items.blocks){return}
    for(const items of question_items.blocks){
      const q_item = document.createElement('div')
      q_item.className = 'block'
      this.elm_question.appendChild(q_item)
      for(let i=0; i<items.length; i++){
        const step = document.createElement('div')
        step.className = 'step'
        for(let j=0; j<items[i].length; j++){
          const piece = document.createElement('div')
          piece.className = 'piece'
          piece.setAttribute('data-bit' , items[i][j])
          step.appendChild(piece)
        }
        q_item.appendChild(step)
      }
    }
  }

  click_answer(){
    this.answer_datas = this.get_block_count_matrix()
    if(this.check_inner()){
      console.log('error : overlap !')
    }
    else if(this.check_outer()){
      console.log('error : outer !')
    }
    else if(this.check_question_blocks()){
      console.log('error : Do not fit !')
    }
    else{
      console.log('ok')
    }
  }
  // pieceが重なっているチェック
  check_inner(){
    if(this.answer_datas.inner.find(e => e.find(e => e >= 2) !== undefined)){return true}
  }
  check_outer(){
    if(this.answer_datas.outer){return true}
  }
  // ブロックの配置をチェック
  get_block_count_matrix(){
    const blocks = this.target.querySelectorAll(':scope > .block')
    const datas = []
    let outer = 0
    // default
    for(let y=0; y<this.count_pieces; y++){
      datas.push([])
      for(let x=0; x<this.count_pieces; x++){
        datas[y].push(0)
      }
    }
    // blocks
    let num = 0
    for(const block of blocks){
      const block_pos = {
        x : ~~(block.offsetLeft / this.size_piece),
        y : ~~(block.offsetTop  / this.size_piece),
      }
      const rotate = Number(block.getAttribute('data-rotate') || 0)
      const data = this.rotate_block_piece(num , rotate)
      for(let i=0; i<data.length; i++){
        for(let j=0; j<data[i].length; j++){
          const shift_pos = {
            x : j + block_pos.x,
            y : i + block_pos.y,
          }
          if(data[i][j] === 0){continue}
          if(shift_pos.x < 0
          || shift_pos.y < 0
          || shift_pos.x >= this.count_pieces
          || shift_pos.y >= this.count_pieces
          || data[i] === undefined
          || data[i][j] === undefined){
            outer++
            continue
          }
          datas[shift_pos.y][shift_pos.x]++
        }
      }
      num++
    }
    return {
      inner : datas,
      outer : outer,
      empty : this.get_empty_matrix(datas)
    }
  }
  get_empty_matrix(datas){
    if(!datas){return}
    const empty_datas = []
    for(let y=0; y<datas.length; y++){
      empty_datas[y] = []
      for(let x=0; x<datas[y].length; x++){
        empty_datas[y][x] = datas[y][x] === 0 ? 0 : 1
      }
    }
    return empty_datas
  }
  check_question_blocks(){
    for(const question_data of this.question_datas.questions[this.question_num].blocks){
      this.check_question_block(question_data)
    }
  }
  check_question_block(question_data){
    const question_str = question_data.flat().join('')
    const len_x = question_data[0].length
    // console.log('Q',question_str, this.answer_datas.empty[0].length  ,len_x , this.answer_datas.empty.length - question_data.length , this.answer_datas.empty[0].length - len_x)
    for(let y=0; y<=this.answer_datas.empty.length - question_data.length; y++){
      for(let x=0; x<=this.answer_datas.empty[0].length - len_x; x++){
        const answer_datas = []
        for(let i=0; i<question_data.length; i++){
          const line = JSON.parse(JSON.stringify(this.answer_datas.empty[y + i]))
          answer_datas.push(line.splice(x , len_x))
        }
        const answer_str = answer_datas.flat().join('')
        const check_bit = this.check_bit(question_str,answer_str)
        console.log(y,x,question_str , answer_str , check_bit)
      }
    }
  }
  // true : 重なり有り , false : 重なりナシ
  check_bit(question_str , answer_str){
    return `0b${question_str}` & `0b${answer_str}` ? true : false
  }

}