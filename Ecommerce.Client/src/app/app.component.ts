import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './nav-bar/nav-bar.component';
import { SpinnerComponentComponent } from './spinner-component/spinner-component.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NavBar,SpinnerComponentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Ecommerce.Client';
}
