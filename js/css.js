export class Css{
  search_value(selector , property , sheets){
    sheets = sheets || document.styleSheets
    let val = ''
    for(const sheet of sheets){
      const res = this.get_rules(selector , property , sheet.cssRules)
      val = res || val
    }
    return val
  }

  get_rules(selector , property , rules){
    let val = ''
    for(const rule of rules){
      if(rule.href){
        const res = this.get_rules(selector , property , rule.styleSheet.cssRules)
        val = res || val
      }
      else{
        const res = this.get_value(selector , property , rule)
        val = res || val
      }
    }
    return val
  }
  get_value(selector , property , rule){
    if(rule.selectorText === selector){
      const reg = new RegExp(property+'(.*?):(.+?);')
      const res = rule.cssText.match(reg)
      return res && res.length && res[2] ? res[2] : ''
    }
  }
}