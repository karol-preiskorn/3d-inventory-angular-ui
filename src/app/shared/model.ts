﻿/*
 * File:        /src/app/shared/model.ts
 * Description:
 * Used by:
 * Dependency: If any operation will be on dimensions? Class or interfance.
 *
 * Model -< Device
 *
 * Date         By     Comments
 * ----------   -----  ------------------------------
 * 2023-04-30   C2RLO  Init
 */

import {adjectives, animals, colors, uniqueNamesGenerator} from 'unique-names-generator'
import {v4 as uuidv4} from 'uuid'
import {DeviceCategoryDict} from './deviceCategories'
import {DeviceTypeDict} from './deviceTypes'

interface Dimension {
  width: number
  height: number
  depth: number
}

interface Texture {
  front: string
  back: string
  side: string
  top: string
  botom: string
}

export class Model {
  _id: string
  name: string
  dimension: Dimension
  texture: Texture
  // TODO: transform deviceType to single object with id, version, name, description from dictionary
  type: string
  category: string

  public print(): void {
    console.log(
      '[model] _id: ' +
        this._id +
        ', name: ' +
        this.name +
        ', dimensions: ' +
        this.getDimensionsString() +
        ', type: ' +
        this.type +
        ', category: ' +
        this.category
    )
  }
  public getString(): string {
    return (
      '[model] _id: ' +
      this._id +
      ', name: ' +
      this.name +
      ', dimensions: ' +
      this.getDimensionsString() +
      ', type: ' +
      this.type +
      ', category: ' +
      this.category
    )
  }
  public json(): string {
    return (
      '{ "_id": "' +
      this._id +
      '", "name": "' +
      this.name +
      '", "dimensions": {' +
      this.getDimensionsString() +
      '", "type": "' +
      this.type +
      '", "category": "' +
      this.category +
      '"}'
    )
  }

  public getDimensionsString(): string {
    return (
      '(width: ' +
      this.dimension?.width +
      ', height: ' +
      this.dimension?.height +
      ', deep: ' +
      this.dimension?.depth +
      ')'
    )
  }
  public getDimensionsJson(): string {
    return JSON.stringify(this.dimension, null, ' ')
  }

  public generate(): void {
    this._id = uuidv4()
    this.name = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      style: 'lowerCase',
      separator: '-',
    }) // big-red-donkey
    this.type = new DeviceTypeDict().getRandomName()
    this.category = new DeviceCategoryDict().getRandomName()
  }
}
