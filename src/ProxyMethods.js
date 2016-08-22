

export default function(constructor, proxyTo='provide') {
  return function(...args) {
    let module = constructor(...args)
    let handlers = {
      get: function(receiver, property) {
        if (module[property] !== undefined) {
          return module[property]
        } else {
          return (...innerArgs) => {
            return module[proxyTo](property, ...innerArgs)
          }
        }
      }
    }
    let prox = new Proxy(module, handlers)
    module.__proxyLess = module
    return prox
  }
}
