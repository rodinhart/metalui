import { Thunk } from "./lang";
export declare type Props = Record<string, any>;
export declare type Component<T extends Props> = ((props: T) => Markup<any>) | ((props: T) => AsyncGenerator<Markup<any>, void, HTMLElement>);
export declare type Markup<T> = null | boolean | number | string | [string | Component<T>, T, ...Markup<any>[]];
export declare const Fragment: ({ children }: {
    children: Markup<any>[];
}) => ({} | null)[];
export declare const lazyLoad: <T>(thunk: Thunk<Component<T>>) => Component<T>;
export declare const renderǃ: (markup: Markup<any>, context?: Record<string, any>) => Promise<Node[]>;
export declare const Scroller: Component<any>;
