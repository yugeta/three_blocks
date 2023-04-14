import { ThreeBlocks } from '../js/three_blocks.js'

/**
 * 対象要素（複数可）をそれぞれ処理開始する
 */

export class Game{
  constructor(options){
    this.options = options || {}
    this.set_array()
  }
  get selector(){
    return '.three-blocks'
  }
  get targets(){
    return document.querySelectorAll(this.selector)
  }

  set_array(){
    for(const target of this.targets){
      new ThreeBlocks({
        target : target
      })
    }
  }
}