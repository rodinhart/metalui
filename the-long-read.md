# The Long Read

UI development is hard, I don't think anyone would disagree with that. First of all there is state. A lot of state. There is state tighly coupled to the display tree, such as element focus, selected text, open drop-downs and drag-n-drop. This state needs to be preserved when updating the UI. There is shared state between components, such as some selection of entities from your data model. There is state for floating windows, and more transient state for modals. And then there are data, mutable or immutable, and in what cirumstance do these constitute state.

Some state outlives a single session and gets persisted to local storage or the server. Oh, and derrived state which is too expensive to calculate on the fly. State can be incomplete (say hello to undefined errors), inconsistent and out-of-sync. The shape of state evolves due to changing requirements, so you better have versioning and a migration path.

A good UI is very important, and because it is so visible to people (by definition), everyone has an opinion. Every developer knows you can spend a day on some backend feature, and 10 minutes on the button that activates it, and the user feedback will be is about the location of the button on the screen. This perhaps results in the UI being more susceptible to change. The UI is also under more scrutiny leading to less compromise for architectural simplicity. An API or SDK can probably get away with being slightly less elegant if the resulting system is significantly simpler.

If the UI is developed in the browser (isn't it always) there are multiple platforms to deal with: DOM, SVG, the canvas and WebGL. There are multiple browsers, and although the situation has greatly improved, there _are_ still differences. Although HTML appears declarative, is cannot be pure because the resulting DOM nodes can have state, and so sometimes the DOM is, and has to be, manipulated using imperative code. HTML has semantic tags (h1, p, label) but they aren't always used because any element can be style to look and behave like any other element. All of this means the UI is not propertly abstracted and the line between UI and all the other JavaScript is woolly.

UI is usually event driven. Additionally, JavaScript is async (non-blocking). Since the introduction of the `async/await` syntax this is no longer an issue in itself but it should be noted that asynchrony is sticky: an async function will force the calling context to be async as well. To put it another way, normal (async) functions can be used in an async context, but not the other way around. Now, most web UI frameworks are synchronous in that a component or render function is _not_ in an async context. There is no way, in a non-blocking single-threaded runtime, to turn async into sync.

## notes

testing

## sketches

`{ data } = useQuery(...)` smells of concurrency, competing for query engine and rendering

multiple passes of the render function now leads to useMemo use.
