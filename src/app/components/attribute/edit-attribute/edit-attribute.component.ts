import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { v4 as uuidv4 } from 'uuid'

import { Component, NgZone, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'

import { AttributeDictionaryService } from '../../../services/attribute-dictionary.service'
import { AttributeService } from '../../../services/attribute.service'
import { ConnectionService } from '../../../services/connection.service'
import { DeviceService } from '../../../services/device.service'
import { LogService } from '../../../services/log.service'
import { ModelsService } from '../../../services/models.service'
import { Attribute } from '../../../shared/attribute'
import { AttributeDictionary } from '../../../shared/attribute-dictionary'
import { ComponentDictionary } from '../../../shared/component-dictionary'
import { Connection } from '../../../shared/connection'
import { Device } from '../../../shared/device'
import { DeviceCategoryDict } from '../../../shared/deviceCategories'
import { DeviceTypeDict } from '../../../shared/deviceTypes'
import { Model } from '../../../shared/model'
import Validation from '../../../shared/validation'

@Component({
  selector: 'app-edit-attribute',
  templateUrl: './edit-attribute.component.html',
  styleUrls: ['./edit-attribute.component.scss'],
})
export class AttributeEditComponent implements OnInit {
  inputId: string
  valid: Validation = new Validation()

  editAttributeForm = new FormGroup(
    {
      _id: new FormControl('', [Validators.required]),
      attributeDictionaryId: new FormControl('', [Validators.required]),
      connectionId: new FormControl(''),
      deviceId: new FormControl(''),
      modelId: new FormControl(''),
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

  component: string
  isSubmitted = false

  ngOnInit() {
    this.inputId = this.activatedRoute.snapshot.paramMap.get('id') || ''
    this.getAttribute(this.inputId).subscribe((data: Attribute) => {
      this.attribute = data
      this.editAttributeForm.setValue({
        _id: data._id,
        attributeDictionaryId: data.attributeDictionaryId,
        connectionId: data.connectionId,
        deviceId: data.deviceId,
        modelId: data.modelId,
        value: data.value,
      })
    })
    this.getDeviceList()
    this.getModelList()
    this.getConnectionList()
    this.getAttributeDictionaryList()
    this.component = this.inputId
  }

  private getAttribute(id: string): Observable<Attribute> {
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
    private activatedRoute: ActivatedRoute,
    private attributeService: AttributeService,
    private deviceService: DeviceService,
    private modelService: ModelsService,
    private connectionService: ConnectionService,
    private attributeDictionaryService: AttributeDictionaryService,
    private logService: LogService,
    private ngZone: NgZone,
  ) {}

  changeModelId(e: Event) {
    const value = (e.target as HTMLInputElement).value
    const objectId = uuidv4.toString()
    this.modelId!.setValue(objectId, { onlySelf: true })
  }

  changeDeviceId(e: Event) {
    const value = (e.target as HTMLInputElement).value
    const objectId = uuidv4.toString()
    this.deviceId?.setValue(objectId, { onlySelf: true })
  }

  changeConnectionId(e: Event) {
    this.connectionId?.setValue((e.target as HTMLInputElement).value, { onlySelf: true })
  }

  changeAttributeDictionaryId(e: Event) {
    this.attributeDictionaryId?.setValue((e.target as HTMLInputElement).value, { onlySelf: true })
  }

  changeValue(e: Event) {
    this.value?.setValue((e.target as HTMLInputElement).value, { onlySelf: true })
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

  findDeviceName(id: string) {
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
