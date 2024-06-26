import { ObjectId } from 'mongodb'
import { DeviceService } from 'src/app/services/device.service'
import { LogIn, LogService } from 'src/app/services/log.service'
import { ModelsService } from 'src/app/services/models.service'
import { Device } from 'src/app/shared/device'
import { Model } from 'src/app/shared/model'
import Validation from 'src/app/shared/validation'

import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-edit-device',
  templateUrl: './edit-device.component.html',
  styleUrls: ['./edit-device.component.scss'],
})
export class DeviceEditComponent implements OnInit {
  device: Device = new Device()
  modelList: Model[]
  valid: Validation = new Validation() // Add this line to define the 'valid' property

  editDeviceForm = new FormGroup({
    _id: new FormControl(new ObjectId(), Validators.required),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    modelId: new FormControl(new ObjectId(), Validators.required),
    position: new FormGroup({
      x: new FormControl<number>(0, [Validators.required, this.valid.numberValidator]),
      y: new FormControl<number>(0, [Validators.required, this.valid.numberValidator]),
      h: new FormControl<number>(0, [Validators.required, this.valid.numberValidator]),
    }),
  })
  attributeComponent: string
  attributeComponentObject: string
  component: string

  constructor(
    public activatedRoute: ActivatedRoute,
    public devicesService: DeviceService,
    private router: Router,
    private logService: LogService,
    private modelsService: ModelsService,
  ) {}

  ngOnInit = () => {
    const id: string = this.activatedRoute.snapshot.paramMap.get('id') || ''
    this.loadModels()
    this.device = this.devicesService.getDeviceSynchronize(id)
    this.editDeviceForm.patchValue({
      _id: this.device._id as unknown as ObjectId,
      name: this.device.name,
      modelId: this.device.modelId as unknown as ObjectId,
      position: {
        x: this.device.position.x,
        y: this.device.position.y,
        h: this.device.position.h,
      },
    })
  }

  loadModels = () => {
    return this.modelsService.GetModels().subscribe((data: Model[]): void => {
      this.modelList = data as Model[]
    })
  }

  submitForm = () => {
    if (this.editDeviceForm.valid && this.editDeviceForm.touched) {
      console.log('DeviceEditComponent.submitForm(): ' + JSON.stringify(this.editDeviceForm.value, null, 2))
      const log: LogIn = {
        message: this.editDeviceForm.value,
        operation: 'Update',
        component: 'Device',
        objectId: this.editDeviceForm.value._id as unknown as ObjectId,
      }
      this.logService.CreateLog(log).subscribe(() => {
        this.devicesService.UpdateDevice(this.editDeviceForm.value as unknown as Device).subscribe(() => {
          this.router.navigate(['device-list'])
        })
      })
    }
  }
}
