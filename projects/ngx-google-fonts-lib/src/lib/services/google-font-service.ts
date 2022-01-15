import { Injectable } from "@angular/core";
import { CollectPendingMethodInvocations } from "@byte-this/funscript";
import { iGoogleFont } from "../models/google-font";
import { HttpClient } from "@angular/common/http";
import { lastValueFrom } from "rxjs";
import { AvlSortedList, iWordWithData, SortedTrie, Trie } from "@byte-this/collections";
import { WEB_SAFE_FONT_NAMES } from "../constants/web-safe-fonts";
import * as WebFont from "webfontloader";

@Injectable({
    providedIn: 'root'
})
export class GoogleFontService {

    KIND_WEB_SAFE_FONT = "Web Safe Font";

    private apiLoaded = false;

    /**
     * We'll use a trie data structure to facilitate
     * fast lookups and prefix lookups
     * 
     * For more info on tries: https://bytethisstore.com/articles/pg/trie
     */
    private fontsTrie = new Trie<iGoogleFont>();

    private apiKey: string = "";

    constructor(
        private httpClient: HttpClient
    ) {
    }

    /**
     * Init default fonts, such as courier new
     * These are not google fonts, and we can add them directly
     */
    private getDefaultFonts(): AvlSortedList<iGoogleFont> {
        const sortedList = new AvlSortedList<iGoogleFont>((a, b) => {
            return a.family.localeCompare(b.family);
        });
        for (const fontName of WEB_SAFE_FONT_NAMES) {
            sortedList.add({
                family: fontName,
                variants: [],
                subsets: [],
                version: "",
                lastModified: "",
                files: {},
                category: this.KIND_WEB_SAFE_FONT,
                kind: this.KIND_WEB_SAFE_FONT
            });
        }
        return sortedList;
    }

    /**
     * We'll have the API key injected via setter property
     */
    setApiKey(apiKey: string): void {
        this.apiKey = apiKey;
    }

    /**
     * Get a font by its family name, or void if there is none
     */
    async getFontByFamilyName(familyName: string): Promise<iGoogleFont | void> {
        await this.fetchFontList();
        return this.fontsTrie.getWordData(this.normalizeWord(familyName));
    }

    /**
     * Get the list of fonts as an iterable structure
     */
    async getFontsIterable(prefix: string = ""): Promise<Iterable<iWordWithData<iGoogleFont>>> {
        await this.fetchFontList();
        const data =  this.fontsTrie.getAllWordsDataWithPrefix(this.normalizeWord(prefix));
        return data;
    }

    /**
     * Attempt to load a font
     * 
     * Return true if success, or already loaded, false otherwise
     */
    async tryLoadFont(fontFamily: string): Promise<boolean> {

        await this.fetchFontList();
        const fontData = this.fontsTrie.getWordData(this.normalizeWord(fontFamily));
        //guard against invalid font family name
        if (!fontData) {
            return false;
        }

        //load font if not web font
        if (fontData.kind === this.KIND_WEB_SAFE_FONT) {
            return true;
        }
        try {
            await WebFont.load({
                google: {
                    families: [fontFamily]
                }
            })
            return true;
        } catch (err) {
            return false;
        }
    }

    @CollectPendingMethodInvocations
    private async fetchFontList(): Promise<void> {
        //only load once
        if (this.apiLoaded) {
            return;
        }

        //guard in case api key is empty
        if (!this.apiKey) {
            return Promise.reject(`Error in ngx-google-fonts: api key was not provided to the google fonts service!`);
        }

        const sortedFonts = this.getDefaultFonts();

        //otherwise, proceed
        const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${this.apiKey}`;
        const response = await lastValueFrom(this.httpClient.get<{items: iGoogleFont[]}>(url));

        if (!response.items) {
            throw new Error("Error in ngx-google-fonts: response is different than expected!");
        }

        for (const font of response.items) {
            // this.fontsTrie.addWord(this.normalizeWord(font.family), font);
            sortedFonts.add(font);
        }

        //now that fonts are sorted, add all to trie
        for (const font of sortedFonts) {
            this.fontsTrie.addWord(this.normalizeWord(font.family), font);
        }

        this.apiLoaded = true;
    }

    /**
     * The trie will store words as lowercase
     */
    private normalizeWord(word: string): string {
        return word.toLowerCase().trim();
    }
}