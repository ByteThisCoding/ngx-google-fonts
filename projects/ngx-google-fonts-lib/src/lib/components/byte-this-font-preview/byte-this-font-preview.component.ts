import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Output, EventEmitter, Input, ElementRef } from "@angular/core";
import { Subscription } from "rxjs";
import { GoogleFontService } from "../../services/google-font-service";

/**
 * This component will NOT respond to input changes after onInit
 * 
 * This loads a font file when this component enters the view area
 */
@Component({
    selector: 'byte-this-google-font-preview',
    templateUrl: './byte-this-font-preview.component.html',
    styleUrls: ['./byte-this-font-preview.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ByteThisFontPreviewComponent implements OnInit, OnDestroy {

    private subs: Subscription[] = [];

    @Input('font-family') fontFamily!: string;

    //if there was an error loading the font, dispatch so parent can hide this element
    @Output('error') error = new EventEmitter<void>();

    constructor(
        private elementRef: ElementRef,
        private googleFontService: GoogleFontService
    ) { }

    ngOnInit(): void {
        const observer = new IntersectionObserver((entries, self) => {
            // iterate over each entry
            entries.forEach(entry => {
                // process just the images that are intersecting.
                // isIntersecting is a property exposed by the interface
                if (entry.isIntersecting) {
                    // custom function that copies the path to the img
                    // from data-src to src
                    this.renderFont();
                    // the image is now in place, stop watching
                    self.unobserve(entry.target);
                }
            });
        }, {});
        observer.observe(this.elementRef.nativeElement);
        this.elementRef.nativeElement.style.fontFamily = this.fontFamily;
    }

    /**
     * Have the google font service load this font
     */
    private async renderFont(): Promise<void> {
        const isLoaded = await this.googleFontService.tryLoadFont(this.fontFamily);

        if (!isLoaded) {
            this.elementRef.nativeElement.style.display = "none";
            this.error.emit(void 0);
        }

    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
        this.subs = [];
    }


}