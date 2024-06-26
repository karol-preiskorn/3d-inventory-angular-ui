import { ObjectId } from 'mongodb'
import { Subscription } from 'rxjs'
import { AttributeDictionaryService } from 'src/app/services/attribute-dictionary.service'
import { AttributeService } from 'src/app/services/attribute.service'
import { ConnectionService } from 'src/app/services/connection.service'
import { DeviceService } from 'src/app/services/device.service'
import { LogService } from 'src/app/services/log.service'
import { ModelsService } from 'src/app/services/models.service'
import { Attribute } from 'src/app/shared/attribute'
import { AttributeDictionary } from 'src/app/shared/attribute-dictionary'
import { ComponentDictionary } from 'src/app/shared/component-dictionary'
import { Connection } from 'src/app/shared/connection'
import { Device } from 'src/app/shared/device'
import { DeviceCategoryDict } from 'src/app/shared/deviceCategories'
import { DeviceTypeDict } from 'src/app/shared/deviceTypes'
import { Model } from 'src/app/shared/model'
import Validation from 'src/app/shared/validation'

import { Component, NgZone, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { faker } from '@faker-js/faker'

@Component({
  selector: 'app-add-attribute',
  templateUrl: './add-attribute.component.html',
  styleUrls: ['./add-attribute.component.scss'],
})
export class AttributeAddComponent implements OnInit {
  valid: Validation = new Validation()

  addAttributeFrom = new FormGroup(
    {
      id: new FormControl(new ObjectId(), [Validators.required]),
      deviceId: new FormControl(new ObjectId() || null, this.valid.atLeastOneValidator),
      modelId: new FormControl(new ObjectId() || null, this.valid.atLeastOneValidator),
      connectionId: new FormControl(new ObjectId() || null, this.valid.atLeastOneValidator),
      attributeDictionaryId: new FormControl(new ObjectId(), Validators.required),
      value: new FormControl('', Validators.required),
    },
    { validators: this.valid.atLeastOneValidator },
  )

  attribute: Attribute
  deviceDictionary: Device[]
  modelDictionary: Model[]
  connectionDictionary: Connection[]
  attributeDictionary: AttributeDictionary[]

  isSubmitted = false
  deviceTypeDict: DeviceTypeDict = new DeviceTypeDict()
  deviceCategoryDict: DeviceCategoryDict = new DeviceCategoryDict()
  componentDictionary: ComponentDictionary = new ComponentDictionary()
  component = 'Attributes'

  ngOnInit() {
    this.formAttribute()
    this.getDeviceList()
    this.getModelList()
    this.getConnectionList()
    this.getAttributeDictionaryList()
  }

  constructor(
    public formBuilder: FormBuilder,
    private ngZone: NgZone,
    private router: Router,
    private attributeService: AttributeService,
    private deviceService: DeviceService,
    private modelService: ModelsService,
    private connectionService: ConnectionService,
    private attributeDictionaryService: AttributeDictionaryService,
    private logService: LogService,
  ) {}

  formAttribute() {
    this.addAttributeFrom = this.formBuilder.group(
      {
        id: [new ObjectId(), Validators.required],
        deviceId: [new ObjectId() || null],
        modelId: [new ObjectId() || null],
        connectionId: [new ObjectId() || null],
        attributeDictionaryId: [new ObjectId(), Validators.required],
        value: ['', Validators.required],
      },
      { validators: this.valid.atLeastOneValidator },
    )
  }

  changeId(e: Event) {
    this.id?.setValue((e.target as HTMLInputElement).value, { onlySelf: true })
  }

  changeModelId(e: Event) {
    this.modelId?.setValue(new ObjectId((e.target as HTMLInputElement).value), { onlySelf: true })
  }

  changeDeviceId(e: Event) {
    const value = (e.target as HTMLInputElement).value
    const objectId = new ObjectId(value)
    this.deviceId?.setValue(objectId, { onlySelf: true })
  }

  changeConnectionId(e: Event) {
    const value = (e.target as HTMLInputElement).value
    const objectId = new ObjectId(value)
    this.connectionId?.setValue(objectId, { onlySelf: true })
  }

  changeAttributeDictionaryId(e: Event) {
    const value = (e.target as HTMLInputElement).value
    const objectId = new ObjectId(value)
    this.attributeDictionaryId?.setValue(objectId, { onlySelf: true })
  }

  changeValue(e: Event) {
    this.value?.setValue((e.target as HTMLInputElement).value, { onlySelf: true })
  }

  get id() {
    return this.addAttributeFrom.get('id')
  }

  get deviceId() {
    return this.addAttributeFrom.get('deviceId')
  }

  get modelId() {
    return this.addAttributeFrom.get('modelId')
  }

  get connectionId() {
    return this.addAttributeFrom.get('connectionId')
  }

  get attributeDictionaryId() {
    return this.addAttributeFrom.get('attributeDictionaryId')
  }

  get value() {
    return this.addAttributeFrom.get('value')
  }

  toString(data: unknown): string {
    // Specify a more specific type for the 'data' parameter
    return JSON.stringify(data, null, 2)
  }

  getDeviceList(): Subscription {
    return this.deviceService.GetDevices().subscribe((data: Device[]) => {
      const tmp = new Device()
      data.unshift(tmp)
      this.deviceDictionary = data
    })
  }

  getModelList(): Subscription {
    return this.modelService.GetModels().subscribe((data: Model[]) => {
      const tmp = new Model()
      data.unshift(tmp)
      this.modelDictionary = data
    })
  }

  getConnectionList(): Subscription {
    return this.connectionService.GetConnections().subscribe((data: Connection[]) => {
      const tmp = new Connection()
      data.unshift(tmp)
      this.connectionDictionary = data
    })
  }

  getAttributeDictionaryList(): Subscription {
    return this.attributeDictionaryService.GetAttributeDictionaries().subscribe((data: AttributeDictionary[]) => {
      this.attributeDictionary = data
    })
  }

  /**
   * @description Generate random data for attribute
   *              1. Select one of List
   *                  - deviceId: [''],
   *                  - modelId: [''],
   *                  - connectionId: [''],
   *              2. get random data from this list
   *              3. get random data from attributeDictionaryId: ['', Validators.required],
   *              4. set random value: ['', Validators.required],
   * @memberof AttributeAddComponent
   */
  generateAttributeDictionary() {
    this.addAttributeFrom.controls.value.setValue(faker.company.name() + ' - ' + faker.company.bs())
  }

  submitForm(): void {
    this.attributeService.CreateAttribute(this.addAttributeFrom.value as Attribute).subscribe(() => {
      this.logService
        .CreateLog({
          objectId: this.addAttributeFrom.get('_id')?.value as unknown as ObjectId,
          message: this.addAttributeFrom.value as Attribute,
          operation: 'Create',
          component: 'Attribute',
        })
        .subscribe(() => {
          this.ngZone.run(() => this.router.navigateByUrl('attribute-list'))
        })
    })
  }
}
