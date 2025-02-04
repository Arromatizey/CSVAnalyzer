import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';  // ✅ Ajouter cette ligne

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient()] // ✅ Ajouter provideHttpClient()
}).catch(err => console.error(err));
