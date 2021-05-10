export declare type Props = Record<string, any>;
declare type Element = null | boolean | number | string | [string, Props, ...Element[]];
export declare type Component = ((props: Props) => Markup) | ((props: Props) => AsyncGenerator<Markup, void, HTMLElement>);
export declare type Markup = null | boolean | number | string | [string | Component, Props, ...Markup[]];
export declare const toxml: (el: Element, gkey?: string, ids?: Record<string, (e: Event) => void>) => string;
export declare const render: (markup: Markup) => Promise<Element>;
export {};
