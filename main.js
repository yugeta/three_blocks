import { Game } from './js/game.js'

export const Main = {

}

switch(document.readyState){
  case 'complete':
  case 'interactive':
    new Game()
    break
  default:
    window.addEventListener('load' , (e => new Game()))
    break
}