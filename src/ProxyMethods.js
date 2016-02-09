// Old-style proxy lib, rather than requiring node --harmony_proxies
import Proxy from 'node-proxy'


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
    return Proxy.createFunction(handlers, function() {
      return module.apply(this, arguments)
    })
  }
}
