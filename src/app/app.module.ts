import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ByteThisNgxGoogleFontsModule } from 'projects/ngx-google-fonts-lib/src/public-api';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ByteThisNgxGoogleFontsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
