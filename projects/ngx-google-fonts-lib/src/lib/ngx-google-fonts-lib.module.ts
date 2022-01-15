import { NgModule } from '@angular/core';
import { HttpClientModule } from  '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ByteThisFontSelectorComponent } from './components/byte-this-font-selector/byte-this-font-selector.component';
import { ByteThisFontPreviewComponent } from './components/byte-this-font-preview/byte-this-font-preview.component';
import { GoogleFontService } from './services/google-font-service';

@NgModule({
  declarations: [
    ByteThisFontSelectorComponent,
    ByteThisFontPreviewComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [
    ByteThisFontSelectorComponent,
    ByteThisFontPreviewComponent
  ],
  providers: [
    GoogleFontService
  ]
})
export class ByteThisNgxGoogleFontsModule {}
