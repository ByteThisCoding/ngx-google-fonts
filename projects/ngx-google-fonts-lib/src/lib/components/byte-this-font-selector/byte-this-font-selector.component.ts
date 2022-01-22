import { Component, ChangeDetectionStrategy, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, OnDestroy, Renderer2, ElementRef } from "@angular/core";
import { iWordWithData } from "@byte-this/collections";
import { BehaviorSubject, combineLatest, filter, Subject, Subscription } from "rxjs";
import { iGoogleFont } from "../../models/google-font";
import { GoogleFontService } from "../../services/google-font-service";

@Component({
    selector: 'byte-this-google-font-selector-input',
    templateUrl: './byte-this-font-selector.component.html',
    styleUrls: ['./byte-this-font-selector.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ByteThisFontSelectorComponent implements OnInit, OnChanges, OnDestroy {

    private subs: Subscription[] = [];

    //iterable of all currently in scope google fonts (prefix filtering included)
    googleApiFontsIterable$ = new BehaviorSubject<Iterable<iWordWithData<iGoogleFont>> | null>(null);

    @Input('google-api-key') googleApiKey: string | null = null;
    googleApiKey$ = new BehaviorSubject<string | null>(this.googleApiKey);

    @Input('value') value: string | null = null;
    value$ = new BehaviorSubject<string | null>(null);

    @Output('hover-value') hoverValue = new EventEmitter<iGoogleFont | null>();

    @Output('change') change = new EventEmitter<iGoogleFont>();

    @Output('error') error = new EventEmitter<any>();

    showOverlay$ = new BehaviorSubject(false);

    //keep track of user prefix input
    prefixInput$ = new BehaviorSubject<string>("");

    constructor(
        private googleFontService: GoogleFontService,
        private renderer: Renderer2,
        private elementRef: ElementRef
    ) { }

    async ngOnInit(): Promise<void> {
        //when prefix is updated, update list of google fonts
        this.subs.push(
            combineLatest([
                this.prefixInput$,
                this.googleApiKey$
            ]).pipe(filter(([prefix, apiKey]) => !!apiKey))
                .subscribe(async ([prefix]) => {
                    this.googleApiFontsIterable$.next(
                        await this.googleFontService.getFontsIterable(prefix!).catch(err => {
                            this.error.emit(err);
                            throw err;
                        })
                    );
                })
        );

        //when value is updated, update prefix
        this.subs.push(
            this.value$.pipe(filter(r => !!r)).subscribe(value => {
                if (value !== this.prefixInput$.value) {
                    this.prefixInput$.next(value!);
                }
            })
        );

        //when value is updated and api key is available, load font
        this.subs.push(
            combineLatest([
                this.value$,
                this.googleApiKey$
            ]).pipe(
                filter(([value, apiKey]) => !!apiKey)
            ).subscribe(([value]) => {
                this.googleFontService.tryLoadFont(value!);
            })
        )

        //if user clicks outside element, close the overlay
        this.renderer.listen('window', 'click', (e: Event) => {
            if (!this.elementRef.nativeElement.contains(e.target)) {
                this.closeOverlay();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['googleApiKey'] && changes['googleApiKey'].currentValue) {
            this.googleFontService.setApiKey(changes['googleApiKey'].currentValue);
            this.googleApiKey$.next(changes['googleApiKey'].currentValue);
        }

        if (changes['value'] && changes['value'].currentValue) {
            this.value$.next(changes['value'].currentValue);
        }
    }

    async onOverlayFontClick(fontFamily: string): Promise<void> {
        this.showOverlay$.next(false);
        const font = await this.googleFontService.getFontByFamilyName(fontFamily);
        this.value$.next(font!.family);
        this.change.emit(font!);
    }

    /**
     * If a preview component has an error, forward it to the consumer
     */
    onPreviewError(event: any): void {
        this.error.emit(event);
    }

    openOverlay(): void {
        this.prefixInput$.next("");
        this.showOverlay$.next(true);

        //scroll to selected font
        if (this.value$.value) {
            //set timeout so element can render first
            setTimeout(() => {
                this.scrollToSelectedValue();
            }, 10);
        }
    }

    closeOverlay(): void {
        this.showOverlay$.next(false);
        this.prefixInput$.next(
            this.value$.value!
        );
        this.hoverValue.next(null);
    }

    previewMouseEnter(font: iGoogleFont): void {
        this.hoverValue.next(font);
    }

    previewMouseLeave(): void {
        this.hoverValue.next(null);
    }


    onUserPrefixInput(event: Event): void {
        event.stopPropagation();
        const value = (event.target as any).value.trim();
        if (value !== this.prefixInput$) {
            this.prefixInput$.next(value);
        }

        //set scroll back to the top to show first filtered item
        const overlay = this.elementRef.nativeElement.querySelector("#overlay");
        overlay.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
        this.subs = [];
    }

    /**
     * Scroll to the selected value, if there is one
     */
    private scrollToSelectedValue(): void {
        const overlay = this.elementRef.nativeElement.querySelector("#overlay");
        const selectedItem = overlay?.querySelector(".font-entry-selected");
        if (selectedItem) {
            const ovPos = overlay.getBoundingClientRect();
            const itPos = selectedItem.getBoundingClientRect();

            const pos = overlay.scrollTop
                + (itPos.top - ovPos.top)
                - ((ovPos.bottom - ovPos.top)/2) + ((itPos.bottom - itPos.top)/2);

            overlay.scrollTo(0, pos);
        }
    }

}