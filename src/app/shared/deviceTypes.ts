﻿/*
 * File:        /src/app/DeviceTypes.ts
 * Description: Defines attribute Device Type list
 * @memberof DeviceTypes
 * Dependency:
 *
 * Date        By     Comments
 * ----------  -----  ------------------------
 * 2023-04-11	 C2RLO	 convert to DeviceType and DeviceTypeList
 * 2023-02-19	 C2RLO	add findType
 * 2023-02-18  C2RLO  Init
 */

interface DeviceTypeInterfance {
  name: string
  description: string
}

type DeviceTypeListType = { name: string; description: string }

export class DeviceType {
  name: string
  description: string
  constructor(deviceType: DeviceTypeListType) {
    this.name = deviceType.name
    this.description = deviceType.description
  }
}

export class DeviceTypeDict {
  list: DeviceType[] = [
    { name: 'Bridge', description: '' },
    { name: 'CoolAir', description: '' },
    { name: 'Copier', description: '' },
    { name: 'Desktop', description: '' },
    { name: 'Firewall', description: '' },
    { name: 'Getaway', description: '' },
    { name: 'Hubs', description: '' },
    { name: 'Load Balancer', description: '' },
    { name: 'Modem', description: '' },
    { name: 'Multiplexer', description: '' },
    { name: 'PDU System', description: '' },
    { name: 'Power', description: '' },
    { name: 'Printer', description: '' },
    { name: 'Probe', description: '' },
    { name: 'Repeaters', description: '' },
    { name: 'Router', description: '' },
    { name: 'Security Device', description: '' },
    { name: 'Server', description: '' },
    { name: 'Switch', description: '' },
    { name: 'Telephone', description: '' },
    { name: 'Terminal', description: '' },
    { name: 'Traffic shaper', description: '' },
    { name: 'Transceiver', description: '' },
    { name: 'UPS System', description: '' },
    { name: 'Workstations', description: '' },
  ]
  get(): DeviceType[] {
    return this.list
  }

  /**
   * Return random type from deviceTypeList
   * @return {*}  {string}
   * @memberof DeviceTypes
   */
  public getRandom(): DeviceType {
    return this.list[Math.floor(Math.random() * this.list.length)]
  }
  /**
   * Find specyfic type in DevieTypeList
   *
   * @param {string} search
   * @return {*}  {string}
   * @memberof DeviceTypes
   */
  findType(search: string): string | DeviceType {
    const element = this.list.find((e) => e.name === search)
    return element || search // element?.DeviceType || search
  }

  findTypeByName(obj: string) {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].name === obj) {
        console.log('-->', obj)
      }
    }
  }
}

const devicesT = new DeviceTypeDict()
const f = devicesT.findTypeByName('Probe')
console.log('-->', f)

/**
 * Function loop over the array, then check if the type property is equal to the property in each object of the array
 *
 * @param {Array<deviceTypeType>} arr
 * @param {deviceTypeType} obj
 */
function findObjinDeviceTypes(
  arr: Array<DeviceTypeListType>,
  obj: DeviceTypeListType
) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].name === obj.name) {
      console.log('-->', obj)
    }
  }
}
// test findObjinDeviceTypes
findObjinDeviceTypes(devicesT.list, { name: 'Workstations', description: '' })