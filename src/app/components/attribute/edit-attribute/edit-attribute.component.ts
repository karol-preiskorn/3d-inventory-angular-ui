import { ObjectId } from 'mongodb'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
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
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-edit-attribute',
  templateUrl: './edit-attribute.component.html',
  styleUrls: ['./edit-attribute.component.scss'],
})
export class AttributeEditComponent implements OnInit {
  inputId: ObjectId
  valid: Validation = new Validation()

  editAttributeForm = new FormGroup(
    {
      _id: new FormControl(new ObjectId(), [Validators.required]),
      attributeDictionaryId: new FormControl(new ObjectId(), [Validators.required]),
      connectionId: new FormControl(new ObjectId()),
      deviceId: new FormControl(new ObjectId()),
      modelId: new FormControl(new ObjectId()),
      value: new FormControl('', [Validators.required]),
    },
    { validators: this.valid.atLeastOneValidator },
  )

  attribute: Attribute
  deviceDictionary: Device[]
  modelDictionary: Model[]
  connectionDictionary: Connection[]
  attributeDictionary: AttributeDictionary[]

  deviceTypeDict: DeviceTypeDict = new DeviceTypeDict()
  deviceCategoryDict: DeviceCategoryDict = new DeviceCategoryDict()
  componentDictionary: ComponentDictionary = new ComponentDictionary()

  component: ObjectId
  isSubmitted = false

  ngOnInit() {
    this.inputId = this.activatedRoute.snapshot.paramMap.get('id') as unknown as ObjectId
    this.getAttribute(this.inputId).subscribe((data: Attribute) => {
      this.attribute = data
      this.editAttributeForm.setValue({
        _id: data._id,
        attributeDictionaryId: data.attributeDictionaryId as ObjectId,
        connectionId: data.connectionId as unknown as ObjectId,
        deviceId: data.deviceId,
        modelId: data.modelId as unknown as ObjectId,
        value: data.value,
      })
    })
    this.getDeviceList()
    this.getModelList()
    this.getConnectionList()
    this.getAttributeDictionaryList()
    this.component = this.inputId
  }

  private getAttribute(id: ObjectId): Observable<Attribute> {
    return this.attributeService.GetAttribute(id).pipe(
      tap((data: Attribute) => {
        console.log('AttributeEditComponent.GetAttribute(' + id + ') => ' + JSON.stringify(data, null, 2))
        this.attribute = data
        this.editAttributeForm.setValue(data)
      }),
    )
  }

  constructor(
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private attributeService: AttributeService,
    private deviceService: DeviceService,
    private modelService: ModelsService,
    private connectionService: ConnectionService,
    private attributeDictionaryService: AttributeDictionaryService,
    private logService: LogService,
  ) {}

  changeModelId(e: Event) {
    const value = (e.target as HTMLInputElement).value
    const objectId = new ObjectId(value)
    this.modelId!.setValue(objectId, { onlySelf: true })
  }

  changeDeviceId(e: Event) {
    const value = (e.target as HTMLInputElement).value
    const objectId = new ObjectId(value) as ObjectId
    this.deviceId?.setValue(objectId, { onlySelf: true })
  }

  changeConnectionId(e: Event) {
    this.connectionId?.setValue((e.target as HTMLInputElement).value as unknown as ObjectId, { onlySelf: true })
  }

  changeAttributeDictionaryId(e: Event) {
    this.attributeDictionaryId?.setValue((e.target as HTMLInputElement).value as never, { onlySelf: true })
  }

  changeValue(e: Event) {
    this.value?.setValue((e.target as HTMLInputElement).value as never, { onlySelf: true })
  }

  get id() {
    return this.editAttributeForm.get('_id')
  }

  get deviceId() {
    return this.editAttributeForm.get('deviceId')
  }

  get modelId() {
    return this.editAttributeForm.get('modelId')
  }

  get connectionId() {
    return this.editAttributeForm.get('connectionId')
  }

  get attributeDictionaryId() {
    return this.editAttributeForm.get('attributeDictionaryId')
  }

  get name() {
    return this.editAttributeForm.get('name')
  }

  get value() {
    return this.editAttributeForm.get('value')
  }

  toString(data: unknown): string {
    return JSON.stringify(data, null, ' ')
  }

  getDeviceList() {
    this.deviceService.GetDevices().subscribe((data: Device[]) => {
      const tmp = new Device()
      data.unshift(tmp)
      this.deviceDictionary = data
    })
  }

  findDeviceName(id: ObjectId) {
    return this.deviceDictionary.find((e) => e._id === id)?.name
  }

  getModelList() {
    this.modelService.GetModels().subscribe((data: Model[]) => {
      const tmp = new Model()
      data.unshift(tmp)
      this.modelDictionary = data
    })
  }

  getConnectionList() {
    this.connectionService.GetConnections().subscribe((data: Connection[]) => {
      const tmp = new Connection()
      this.connectionDictionary = [tmp, ...data]
    })
  }

  getAttributeDictionaryList() {
    this.attributeDictionaryService.GetAttributeDictionaries().subscribe((data: AttributeDictionary[]) => {
      const tmp = new AttributeDictionary()
      this.attributeDictionary = [tmp, ...data]
    })
  }

  submitForm() {
    const attributeValue: Attribute = this.editAttributeForm.value as Attribute
    this.attributeService.UpdateAttribute(this.inputId, attributeValue).subscribe(() => {
      this.logService
        .CreateLog({
          objectId: attributeValue._id,
          message: attributeValue,
          operation: 'Update',
          component: 'Attribute',
        })
        .subscribe(() => {
          this.ngZone.run(() => this.router.navigateByUrl('attribute-list'))
        })
    })
  }
}
