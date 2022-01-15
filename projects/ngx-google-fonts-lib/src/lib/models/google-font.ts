/**
 * This represents the model of a single Google font's data
 */
export interface iGoogleFont {
    family: string;
    variants: string[];
    subsets: string[];
    version: string;
    lastModified: string;
    files: {
        [key: string]: string;
    };
    category: string;
    kind: string;
}