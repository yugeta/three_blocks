// import { Control } from './control.js'
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

  get rotates(){
    return [0,90,180,270]
  }

  get question_blocks(){
    return this.question_datas.questions[this.question_num].blocks
  }

  get elm_links(){
    return document.querySelector('.three-blocks .links ol')
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
    this.add_table()
    this.add_submit()
    this.add_question()
    this.add_links()
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
  add_links(){
    const div = document.createElement('div')
    div.className = 'links'
    this.options.target.appendChild(div)
    const ul = document.createElement('ol')
    div.appendChild(ul)
    const datas = this.load_clears()
    if(datas && datas.length){
      this.add_link_items(datas, true)
      const next_id = datas[datas.length-1]+1
      this.question_num = this.question_datas.questions.findIndex(e => e.id === next_id)
    }
  }
  add_link_items(items , clear_flg){
    if(!items || !items.length){return}
    for(const item of items){
      const id = item
      const li = document.createElement('li')
      li.textContent = id
      li.setAttribute('data-id' , id)
      li.setAttribute('data-clear' , clear_flg ? 1 : 0)
      li.addEventListener('click' , (e=>{
        const id = e.currentTarget.getAttribute('data-id')
        this.any_questions(id)
      }).bind(this))
      this.elm_links.appendChild(li)
      const a = document.createElement('a')
    }
  }
  add_submit(){
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
  reset_answer_blocks(){
    const blocks = this.target.querySelectorAll(`:scope > .block`)
    for(let i=0; i<blocks.length; i++){
      const x = this.target.offsetWidth + 10
      const y = i * (this.size_piece * 3)
      blocks[i].style.setProperty('left' , `${x}px`,'')
      blocks[i].style.setProperty('top'  , `${y}px`,'')
      blocks[i].setAttribute('data-rotate' , 0)
      blocks[i].setAttribute('data-flip'   , 0)
      this.set_block_piece(blocks[i])
    }
  }

  // ブロックの作成 + 配置
  add_block(num){
    const block = document.createElement('div')
    block.classList.add('block')
    block.setAttribute('data-block-num' , num)
    block.setAttribute('data-rotate' , 0)
    block.setAttribute('data-flip'   , 0)
    this.target.appendChild(block)
    this.set_block_piece(block)
    const x = this.target.offsetWidth + 10
    const y = num * (this.size_piece * 3)
    block.style.setProperty('left' , `${x}px`,'')
    block.style.setProperty('top'  , `${y}px`,'')
    this.current_map = {
      x : x,
      y : y,
    }
  }

  // ブロク内のピース作成+配置
  set_block_piece(block){
    this.del_block_piece(block)
    const num    = Number(block.getAttribute('data-block-num'))
    const rotate = Number(block.getAttribute('data-rotate') || 0)
    const flip   = Number(block.getAttribute('data-flip') || 0)
    const data   = this.rotate_block_piece(this.question_datas.block_pieces[num].map, rotate , flip)
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
  rotate_block_piece(data , rotate , flip){
    const new_data = []
    if((rotate === 90 && flip === 0)
    || (rotate === 270 && flip === 1)){
      for(let i=data.length-1; i>=0; i--){
        for(let j=0; j<data[i].length; j++){
          new_data[j] = new_data[j] || []
          if(flip){
            new_data[j].unshift(data[i][j])
          }
          else{
            new_data[j].push(data[i][j])
          }
        }
      }
      return new_data
    }
    else if(rotate === 180){
      for(let i=data.length-1; i>=0; i--){
        for(let j=data[i].length-1; j>=0; j--){
          new_data[data.length-1 - i] = new_data[data.length-1 - i] || []
          if(flip){
            new_data[data.length-1 - i].unshift(data[i][j])
          }
          else{
            new_data[data.length-1 - i].push(data[i][j])
          }
        }
      }
      return new_data
    }
    if((rotate === 270 && flip === 0)
    || (rotate === 90 && flip === 1)){
      for(let i=data.length-1; i>=0; i--){
        for(let j=data[i].length-1; j>=0; j--){
          let row
          if(flip){
            row = data[i].length-1 - j
            new_data[row] = new_data[row] || []
            new_data[row].push(data[i][j])
          }
          else{
            row = data[i].length-1 - j
            new_data[row] = new_data[row] || []
            new_data[row].unshift(data[i][j])
          }
          
        }
      }
      return new_data
    }
    else if(flip){
      for(let i=0; i<data.length; i++){
        for(let j=0; j<data[i].length; j++){
          new_data[i] = new_data[i] || []
          if(flip){
            new_data[i].unshift(data[i][j])
          }
          else{
            new_data[i].push(data[i][j])
          }
        }
      }
      return new_data
    }
    else{
      return data
    }
  }

  set_control(){
    window.addEventListener('mousedown'  , this.mousedown.bind(this))
    window.addEventListener('mousemove'  , this.mousemove.bind(this))
    window.addEventListener('mouseup'    , this.mouseup.bind(this))
    window.addEventListener('touchstart' , this.touchstart.bind(this))
    window.addEventListener('touchmove'  , this.touchmove.bind(this), {passive : false})
    window.addEventListener('touchend'   , this.touchend.bind(this))
  }

  /* PC-mouse */
  mousedown(e){
    this.event_start({
      target : e.target.closest('.block[data-block-num]'),
      x      : e.pageX,
      y      : e.pageY,
    })
  }
  mousemove(e){
    this.event_move({
      x : e.pageX,
      y : e.pageY,
    })
  }
  mouseup(e){
    this.event_end()
  }

  /* Smartphone-touch */
  touchstart(e){
    this.event_start({
      target : e.target.closest('.block[data-block-num]'),
      x      : e.touches[0].pageX,
      y      : e.touches[0].pageY,
    })
  }
  touchmove(e){
    this.event_move({
      x : e.touches[0].pageX,
      y : e.touches[0].pageY,
    })
    e.preventDefault()
  }
  touchend(e){
    this.event_end()
  }

  event_start(options){
    if(!options || !options.target){return}
    options.left = options.target.offsetLeft
    options.top  = options.target.offsetTop
    const map = this.get_near_map({
      x : options.left,
      y : options.top,
    })
    this.block_data = {
      target   : options.target,
      x        : options.left,
      y        : options.top,
      w        : options.target.scrollWidth,
      h        : options.target.scrollHeight,
      mx       : options.x,
      my       : options.y,
      mx2      : options.x,
      my2      : options.y,
      move_map : map,
      time : (+new Date()),
    }
    options.target.setAttribute('data-status','active')
    this.options.target.setAttribute('data-status' , 'active')
    setTimeout(this.push_flip.bind(this) , 500)
  }
  event_move(options){
    if(!this.block_data){return}
    this.block_data.mx2 = options.x
    this.block_data.my2 = options.y
    const diff_pos = {
      x : options.x - this.block_data.mx,
      y : options.y - this.block_data.my,
    }
    const pos = this.piece_pos_limit({
      x : this.block_data.x + diff_pos.x,
      y : this.block_data.y + diff_pos.y,
    })
    this.block_data.target.style.setProperty('left' , `${pos.x}px`, '')
    this.block_data.target.style.setProperty('top'  , `${pos.y}px`, '')
    this.block_data.move     = true
    this.block_data.move_map = this.get_near_map(pos)
  }
  event_end(options){
    if(!this.block_data){return}
    this.block_snap()
    this.current_map = this.block_data.move_map
    if(this.check_rotate()){
      this.block_rotate()
    }
    this.block_data.target.removeAttribute('data-status')
    this.options.target.removeAttribute('data-status')
    delete this.block_data
  }

  click_rotate(){}
  click_flip(){}
  
  push_flip(){
    if(!this.block_data
    || this.block_data.move === true){return}
    this.block_flip()
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
    // this.del_block_piece(this.block_data.target)
    this.set_block_piece(this.block_data.target)
  }

  // flip
  block_flip(){
    const elm = this.block_data.target
    let flip = Number(elm.getAttribute('data-flip') || 0)
    flip = flip ? 0 : 1
    this.block_data.target.setAttribute('data-flip' , flip)
    this.set_block_piece(this.block_data.target)
  }

  get_near_map(pos){
    return {
      x : ~~((pos.x + (this.size_piece/2)) / this.size_piece) * this.size_piece,
      y : ~~((pos.y + (this.size_piece/2)) / this.size_piece) * this.size_piece,
    }
  }

  view_question(){
    if(this.question_num === undefined){
      alert('全ての問題をクリアしています。')
      return
    }
    const num = this.question_num
    const question_items = this.question_datas.questions[num]
    if(!question_items || !question_items.blocks){return}
    this.clear_question()
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
    const id = question_items.id
    const link_elm = this.elm_links.querySelector(`[data-id='${id}']`)
    if(link_elm){
      link_elm.setAttribute('data-status' , 'active')
    }
    else{
      this.add_link_items([id])
    }
  }
  clear_link_active(){
    const elms = this.elm_links.querySelectorAll(`[data-id]`)
    for(const elm of elms){
      if(!elm.hasAttribute('data-status')){continue}
      elm.removeAttribute('data-status')
    }
  }
  clear_question(){
    this.elm_question.innerHTML = ''
  }

  click_answer(){
    this.answer_datas = this.get_block_count_matrix()
    // 配置ブロクの重なりチェック
    if(this.check_inner()){
      this.error('error : overlap !')
    }
    // 枠外はみ出しチェック
    else if(this.check_outer()){
      this.error('error : outer !')
    }
    // 空き状態に問題ブロックをはめ込む判定判定（true:不正解）
    else if(this.check_question_blocks(JSON.parse(JSON.stringify(this.answer_datas.empty)))){
      this.error('error : Do not fit !')
    }
    // 正解
    else{
      this.corrected_question()
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
      const flip   = Number(block.getAttribute('data-flip') || 0)
      const data = this.rotate_block_piece(this.question_datas.block_pieces[num].map , rotate , flip)
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

  // 正解判定
  check_question_blocks(answer_data , question_num){
    question_num = question_num || 0
    if(question_num >= this.question_blocks.length){return false}
    for(const flip of [0,1]){
      for(const rotate of this.rotates){
        const question_data = this.rotate_block_piece(this.question_blocks[question_num] , rotate , flip)
        const len_x = question_data[0].length
        const question_str = question_data.flat().join('')
        for(let y=0; y<=answer_data.length - question_data.length; y++){
          for(let x=0; x<=answer_data[0].length - len_x; x++){
            const answer_datas = []
            for(let i=0; i<question_data.length; i++){
              const line = JSON.parse(JSON.stringify(answer_data[y + i]))
              answer_datas.push(line.splice(x , len_x))
            }
            const answer_str = answer_datas.flat().join('')
            const check_bit = this.check_overlap_bit(question_str , answer_str)
            if(check_bit === false){
              const update_answer_data = this.merge_data(answer_data , question_data , y , x)
              const res = this.check_question_blocks(update_answer_data , question_num+1)
              if(res === false){
                return false
              }
            }
          }
        }
      }
    }

    return true
  }

  // true : 重なり有り（不正解） , false : 重なりナシ（正解）
  check_overlap_bit(question_str , answer_str){
    return `0b${question_str}` & `0b${answer_str}` ? true : false
  }

  // 答えblockをはめ込んだ配置マップを作成
  merge_data(data1 , data2 , shift_y , shift_x){
    const new_data = []
    for(let i=0; i<data1.length; i++){
      new_data[i] = []
      for(let j=0; j<data1[i].length; j++){
        new_data[i][j] = data1[i][j]
      }
    }
    for(let i=0; i<data2.length; i++){
      for(let j=0; j<data2[i].length; j++){
        new_data[shift_y + i][shift_x + j] += data2[i][j]
      }
    }
    return new_data
  }

  error(message){
    alert(message)
  }

  corrected_question(){
    this.clear_question()
    this.set_message(`<dis>正解！</div><div><button class='next'>次の問題</button></div>`)
    this.elm_question.querySelector('.next').addEventListener('click' , this.next_question.bind(this))

    // links操作
    const id = this.question_datas.questions[this.question_num].id
    const link_elm = this.elm_links.querySelector(`[data-id='${id}']`)
    if(link_elm){
      link_elm.setAttribute('data-clear' , '1')
    }

    // localstorage
    const clear_datas = this.load_clears()
    if(!clear_datas.find(e => e === id)){
      this.save_clear_id(id)
    }
  }
  set_message(message){
    this.elm_question.innerHTML = message
  }

  next_question(){
    this.question_num++
    this.reset_answer_blocks()
    this.view_question()
  }

  any_questions(id){
    this.question_num = this.search_question_num(id)
    this.reset_answer_blocks()
    this.view_question()
  }
  search_question_num(id){console.log(this.question_datas)
    const question_index = this.question_datas.questions.findIndex(e => String(e.id) === String(id))
    return question_index
  }

  save_clear_id(id){
    const datas = this.load_clears() || []
    datas.push(id)
    const json = JSON.stringify(datas.sort())
    window.localStorage.setItem('three-blocks-clear' , json)
  }
  load_clears(){
    const json = window.localStorage.getItem('three-blocks-clear')
    return json ? JSON.parse(json) : []
  }
}