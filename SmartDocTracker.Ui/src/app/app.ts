// import { Component, signal } from '@angular/core';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.html',
//   standalone: false,
//   styleUrl: './app.scss'
// })
// export class App {
//   protected readonly title = signal('smart-doc-tracker-ui');
// }



// app.component.ts
import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: false,
})
export class App{
  showSidebar = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showSidebar = !event.url.includes('/login');
      });
  }
}