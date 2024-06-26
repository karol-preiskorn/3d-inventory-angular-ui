import { Component } from '@angular/core'
import { setTheme } from 'ngx-bootstrap/utils'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = '3d-inventory-angular-ui'
  public myTheme: string = 'light'

  themeSwitch() {
    if (this.myTheme === 'light') {
      console.log('theme dark')
      this.myTheme = 'dark'
    } else {
      console.log('theme light')
      this.myTheme = 'light'
    }
  }

  currentYearLong(): number {
    return new Date().getFullYear()
  }

  constructor() {
    setTheme('bs5')
  }
}
