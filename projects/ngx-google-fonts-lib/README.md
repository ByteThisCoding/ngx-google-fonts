# ngx-google-fonts

This library provides a component which handles:
* Loading the list of Google fonts, and combining with web safe fonts.
* Allowing the user to select from a drop-down-like list, where each font name renders in its own font.
* Allowing the user to filter the list by prefix.
* Emitting events for hover and user selection.
* Lazy loading all required fonts as they come into view.

The pages below outline how to use the component:
* [Getting Started: How to Use the Component](https://bytethisstore.com/articles/pg/angular-font-selector-component)
* [Implementatino Details: How the Component is Made](https://bytethisstore.com/articles/pg/angular-font-selector-implementation)

Below, we'll provide a summarized version of this information.

## Getting Started
Using the component itself is straightforward. We just need to put the component in our HTML, hook it up with inputs and outputs, and import it into our module. The component itself will take care of everything else.

Here is an example HTML which uses the component and hooks up to input and output properties:
```html
<!-- Angular Component HTML -->
<byte-this-google-font-selector-input
    <!-- Input for the API key required by Google -->
    [google-api-key]="apiKey$ | async"
    <!-- An optional starting value for the font -->
    value="Aguafina Script"
    <!-- Event when the selected font is changed -->
    (change)="onFontChange($event)"
    <!-- Event when the mouse hovers over a font without selecting it -->
    (hover-value)="onFontHover($event)"
></byte-this-google-font-selector-input>
```

This is the code for the corresponding TypeScript component class:
```typescript
@Component({
    /** omitted for brevity **/
})
export class GettingStartedComponent {

    //example service which retrieves your API key from some place
    apiKey$ = this.configService.getGoogleApiKey();

    constructor(
        private configService: ConfigService
    ) {}

    /**
     * iGoogleFont is the data type for the font:
     * font family, variants, and other data from google fonts api
     */ 
    onFontChange(font: iGoogleFont): void {
        console.log("Font changed:", font);
    }

    /**
     * Font hover can be useful for preview purposes,
     * such as showing the user how it would look before selecting it
     */ 
    onFontHover(font: iGoogleFont): void {
        console.log("Font hover:", font);
    }
}
```

The module declaration is as follows:
```typescript
/**
 * We have to import this into the module before using it
 */

@NgModule({
    /** other code omitted for brevity **/
    imports: [
        ByteThisNgxGoogleFontsModule
    ]
})
export class GettingStartedModule {}
```

## Running This Project Locally
If you'd like to work with this repo and explore the code, run locally, and even make code changes:
1. Clone this project.
1. Run `npm install` to get the dependencies.
1. Run `ng serve` to launch a runner app which contains the component and instructions for working with it.