import { ChangeDetectionStrategy, Component } from '@angular/core';
import { iGoogleFont } from 'projects/ngx-google-fonts-lib/src/lib/models/google-font';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  tentativeApiKey$ = new BehaviorSubject("");
  apiKey$ = new BehaviorSubject<string | null>(null);

  selectedFont$ = new BehaviorSubject("<none>");
  hoverFont$ = new BehaviorSubject("<none>");

  onApiKeyChange(event: Event): void {
    const value = (event.target as any).value;
    this.tentativeApiKey$.next(value);
  }

  onKeySubmit(): void {
    this.apiKey$.next(this.tentativeApiKey$.value);
    console.log("Submitting key: "+this.tentativeApiKey$.value);
  }

  onFontChange(event: iGoogleFont): void {
    this.selectedFont$.next(event.family);
  }

  onFontHover(font: iGoogleFont | null): void {
    this.hoverFont$.next(font ? font.family : "<none>");
  }
}
