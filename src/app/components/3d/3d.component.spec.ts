import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CubeComponent } from './3d.component'

describe('CubeComponent', () => {
  let component: CubeComponent
  let fixture: ComponentFixture<CubeComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CubeComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(CubeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
