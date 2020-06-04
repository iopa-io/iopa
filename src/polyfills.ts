export default function polyfillIopa300(app: any) {
  app.properties['server.Capabilities'].get = (key: string) =>
    app.properties['server.Capabilities'][key]

  app.properties['server.Capabilities'].set = (key: string, value: any) => {
    app.properties['server.Capabilities'][key] = value
  }

  app.setCapability = app.properties['server.Capabilities'].set
  app.capability = app.properties['server.Capabilities'].get

  app.properties.get = (key: string) => app.properties[key]
  app.properties.set = (key: string, value: any) => {
    app.properties[key] = value
  }

  app.properties.toJSON = toJSON.bind(app.properties)

  app.properties['server.Capabilities'].toJSON = toJSON.bind(
    app.properties['server.Capabilities']
  )

  app.use(function polyfillIopa300(context, next) {
    context.capability = (key: string) => context['server.Capabilities'][key]
    return next()
  }, 'polyfillIopa300')
}

function toJSON<T>(this: T): T {
  return Object.entries(this)
    .filter(
      ([key, _]) =>
        [
          'get',
          'set',
          'delete',
          'toJSON',
          'capability',
          'setCapability'
        ].indexOf(key) === -1
    )
    .reduce((result, [key, value]) => {
      result[key] = value
      return result
    }, {} as T)
}
