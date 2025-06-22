import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    SideMenuComponent,
    RouterOutlet,
  ],
  providers: [],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  constructor() { }

  ngOnInit(): void { }


}
