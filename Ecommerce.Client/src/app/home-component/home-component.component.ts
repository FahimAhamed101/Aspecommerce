import { Component } from '@angular/core';
import { ShopComponent } from '../shop-component';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [ShopComponent],
  templateUrl: './home-component.component.html',
  styleUrl: './home-component.component.css'
})
export class HomeComponentComponent {

}
