import { Thunk } from "./lang";
export declare type Props = Record<string, any>;
declare type ChildrenProp = {
    children: Markup<any>[];
};
export declare type SyncComponent<T extends Props> = (props: T & ChildrenProp) => Markup<any>;
export declare type AsyncComponent<T extends Props> = (props: T & ChildrenProp) => AsyncGenerator<Markup<any>, void, HTMLElement>;
export declare type Component<T extends Props> = SyncComponent<T> | AsyncComponent<T>;
export declare type Markup<T> = null | boolean | number | string | [string, Props, ...Markup<any>[]] | [Component<T>, T, ...Markup<any>[]];
export declare const Fragment: SyncComponent<{}>;
export declare const lazyLoad: <T>(thunk: Thunk<Component<T>>) => Component<T>;
export declare const renderǃ: <T>(markup: Markup<T>, context?: Record<string, any>) => Promise<Node[]>;
export declare const Scroller: Component<any>;
export {};
