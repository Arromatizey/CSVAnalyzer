import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`, // Utilisation correcte du template inline
  styleUrls: ['./app.component.css'] // Correction du nom de l'attribut
})
export class AppComponent {
  title = 'mon-projet-angular';
}
