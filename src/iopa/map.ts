/* eslint-disable no-restricted-syntax */
import type {
  IopaRefMap,
  IopaRef,
  IopaMap as IopaMapType,
  IopaMapInit
} from 'iopa-types'

export default class IopaMap<T> implements IopaRefMap<T>, IopaMapType<T> {
  constructor(data?: IopaMapInit<T>, prevData?: IopaMapType<T>) {
    if (prevData) {
      this._loadEntries(prevData.entries())
    }
    if (data) {
      if (Array.isArray(data)) {
        this._loadEntries(data)
      } else if ('entries' in data) {
        this._loadEntries((data.entries as Function)())
      } else {
        this._loadEntries(
          Object.entries((data as unknown) as Record<keyof T, T[keyof T]>) as [
            keyof T,
            T[keyof T]
          ][]
        )
      }
    }
  }

  private _loadEntries(entries: [keyof T, T[keyof T]][]) {
    for (const entry of entries) {
      this.set(entry[0], entry[1])
    }
  }

  get<K extends keyof T>(key: K): T[K] {
    return this[(key as unknown) as string]
  }

  has<K extends keyof T>(key: K): boolean {
    return key in this
  }

  addRef<I extends T>(iopaRef: IopaRef<T>, value: I): I {
    this[iopaRef.id] = value
    return value
  }

  getRef(iopaRef: IopaRef<T>): T | undefined {
    return this[iopaRef.id]
  }

  set(value: IopaMapInit<T>): void

  set<K extends keyof T>(key: K, value: T[K]): void

  set<K extends keyof T>(data: IopaMapInit<T> | K, value?: T[K]): void {
    if (value || typeof data !== 'object') {
      this[(data as unknown) as string] = value
      return
    }
    if (Array.isArray(data)) {
      this._loadEntries(data)
    } else if ('entries' in data) {
      this._loadEntries((data.entries as Function)())
    } else {
      this._loadEntries(
        Object.entries((data as unknown) as Record<keyof T, T[keyof T]>) as [
          keyof T,
          T[keyof T]
        ][]
      )
    }
  }

  default<K extends keyof T>(key: K, valueFn: T[K] | (() => T[K])) {
    if (key in this) {
      /** noop */
    } else if (typeof valueFn === 'function') {
      this.set(key, (valueFn as Function)())
    } else {
      this.set(key, valueFn)
    }
    return this.get(key)
  }

  entries(): [any, any][] {
    return Object.entries(this) as any
  }

  delete<K extends keyof T>(key: K): boolean {
    if (key in this) {
      delete this[(key as unknown) as string]
      return true
    }
    return false
  }

  toString(): string {
    return jsonSerialize(this.toJSON())
  }

  toJSON(): T {
    const jsonObj: any = {}

    for (const key of Object.getOwnPropertyNames(this).filter(
      (key) => !key.startsWith('_') && !BLACK_LIST_STRINGIFY.includes(key)
    )) {
      jsonObj[key] = this[key]
    }

    const proto1 = Object.getPrototypeOf(this)
    const proto2 = Object.getPrototypeOf(proto1)
    ;[proto1, proto2].forEach((proto) => {
      for (const key of Object.getOwnPropertyNames(proto)) {
        const desc = Object.getOwnPropertyDescriptor(proto, key)
        const hasGetter = desc && typeof desc.get === 'function'
        if (hasGetter) {
          jsonObj[key] = desc.get.call(this)
        }
      }
    })

    return jsonObj
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
      if ('toJSON' in value) {
        return value.toJSON()
      }
    }
    return value
  }
}

const jsonSerialize = (data) => JSON.stringify(data, getCircularReplacer(), 2)
type HEADERS = Record<string, string>

export class IopaHeaders extends IopaMap<HEADERS> {
  get(name: keyof HEADERS): string {
    name = `${name}`
    const key = find(this, name)
    if (key === undefined) {
      return null
    }

    let val = this[key]
    if (name.toLowerCase() === 'content-encoding') {
      val = val.toLowerCase()
    }

    return val
  }

  set(data: any, value?: string): void {
    if (typeof data === 'string') {
      return super.set(find(this, data) || data, value)
    }

    return super.set(data, value)
  }

  has(name: keyof HEADERS): boolean {
    return !!find(this, `${name}`)
  }
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map: {}, name: string) {
  name = name.toLowerCase()
  return Object.keys(map).find((key) => key.toLowerCase() === name)
}

const BLACK_LIST_STRINGIFY = [
  'server.CancelToken',
  'server.CancelTokenSource',
  'get',
  'set',
  'delete',
  'toJSON',
  'capability',
  'setCapability',
  'iopa.Events',
  'server.Capabilities'
]
