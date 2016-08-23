

export default function(constructor, proxyTo='provide') {
  return function(...args) {
    let module = constructor(...args)
    let handlers = {
      get: function(target, property, receiver) {
        if (target[property] !== undefined) {
          return target[property]
        } else {
          return (...innerArgs) => {
            return target[proxyTo](property, ...innerArgs)
          }
        }
      }
    }
    let prox = new Proxy(module, handlers)
    module.__proxyLess = module
    return prox
  }
}
