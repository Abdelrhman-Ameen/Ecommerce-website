import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StoreHeaderComponent } from './store-header.component';
import { StoreFooterComponent } from './store-footer.component';

@Component({ selector: 'app-store-layout', standalone: true, imports: [RouterOutlet, StoreHeaderComponent, StoreFooterComponent], template: `<app-store-header/><main><router-outlet/></main><app-store-footer/>` })
export class StoreLayoutComponent {}
