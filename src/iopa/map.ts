import type { IopaRefMap, IopaRef } from 'iopa-types'

export default class IopaMap<T> implements IopaRefMap {
  constructor(data?: Partial<T>) {
    if (data) {
      Object.keys(data).forEach((key) => {
        this[key] = data[key]
      })
    }
  }

  get<K extends keyof T>(key: K): T[K] {
    return this[(key as unknown) as string]
  }

  addRef<R, I extends R>(iopaRef: IopaRef<R>, value: I): I {
    this[iopaRef.id] = value
    return value
  }

  getRef<T>(iopaRef: IopaRef<T>): T | undefined {
    return this[iopaRef.id]
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

  toString(): string {
    const tempResult = Object.entries(this)
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
    return jsonSerialize(tempResult)
  }

  toJSON(): T {
    return JSON.parse(this.toString())
  }
}

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return undefined
      }
      seen.add(value)
    }
    return value
  }
}

const jsonSerialize = (data) => JSON.stringify(data, getCircularReplacer())
