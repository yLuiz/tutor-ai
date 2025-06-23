import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    SideMenuComponent,
    RouterOutlet,
    CommonModule
  ],
  providers: [],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {

  menuVisible = true;
  mobileBreakpoint = 768;
  isMobile = false;

  @ViewChild('sideMenuRef') sideMenuRef!: ElementRef;

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  constructor() { }

  ngOnInit(): void {
    this.updateMenuVisibility();
  }

  // Escuta mudanças no tamanho da janela
  @HostListener('window:resize', [])
  onWindowResize() {
    this.updateMenuVisibility();
  }

  updateMenuVisibility() {
    this.isMobile = window.innerWidth <= this.mobileBreakpoint;
    this.menuVisible = !this.isMobile;
  }


}
