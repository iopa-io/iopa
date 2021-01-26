import { IopaContext, IopaRef } from 'iopa-types'

export default function polyfillIopa300(app: any) {
  app.properties['server.Capabilities'].get = (key: string) =>
    app.properties['server.Capabilities'][key]

  app.properties['server.Capabilities'].set = (key: string, value: any) => {
    app.properties['server.Capabilities'][key] = value
  }

  app.capability = (keyOrRef) => {
    if (typeof keyOrRef === 'string') {
      return app.properties['server.Capabilities'].get(keyOrRef as string)
    }
    return app.properties['server.Capabilities'][keyOrRef.id]
  }
  app.setCapability = (keyOrRef: string | IopaRef<any>, value: any) => {
    if (typeof keyOrRef === 'string') {
      app.properties['server.Capabilities'].set(keyOrRef as string, value)
      return
    }
    app.properties['server.Capabilities'][(keyOrRef as IopaRef<any>).id] = value
  }
  app.properties.get = (key: string) => app.properties[key]
  app.properties.set = (key: string, value: any) => {
    app.properties[key] = value
  }

  app.properties.toJSON = toJSON.bind(app.properties)

  app.properties['server.Capabilities'].toJSON = toJSON.bind(
    app.properties['server.Capabilities']
  )

  app.use(function polyfillIopa300(
    context: IopaContext,
    next: () => Promise<void>
  ) {
    context.capability = (keyOrRef) => {
      if (typeof keyOrRef === 'string') {
        return context['server.Capabilities'].get(keyOrRef as any)
      }
      return context['server.Capabilities'][keyOrRef.id]
    }
    return next()
  },
  'polyfillIopa300')
}

function toJSON<T>(this: T): T {
  return Object.entries(this)
    .filter(
      ([key]) =>
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
