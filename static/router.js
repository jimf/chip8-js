module.exports = function () {
  const routes = []
  let unroute

  function dispatch (hash) {
    hash = hash.slice(1)
    const route = routes.find(r => r.route.test(hash))
    if (route) {
      if (unroute) {
        unroute()
      }
      return route.callback(hash.match(route.route).slice(1))
    }
  }

  return {
    route (route, callback) {
      routes.push({
        route: route,
        callback: callback
      })
    },
    go (page) {
      window.location.hash = '#' + page
    },
    start () {
      window.addEventListener('hashchange', (e) => {
        dispatch(e.newURL.slice(e.newURL.lastIndexOf('#')))
      })
      dispatch(window.location.hash || '#/')
    }
  }
}
