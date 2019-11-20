export default class IopaMap<T> {
  constructor(data?: Partial<T>) {
    if (data) {
      Object.keys(data).forEach(key => {
        this[key] = data[key]
      })
    }
  }

  get<K extends keyof T>(key: K): T[K] {
    return this[(key as unknown) as string]
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    this[(key as unknown) as string] = value
  }

  delete<K extends keyof T>(key: K): boolean {
    if (key in this) {
      delete this[(key as unknown) as string]
      return true
    }
    return false
  }

  toJSON(): T {
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
}
