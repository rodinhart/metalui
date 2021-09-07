# metalui

An anti-framework

## FFS, not another one?

I'm afraid so...

## What's wrong with React?

An awful lot, but most importantly, the render function in React is sync while JavaScript is fundamentally async. To bridge this impedance mismatch one is forced to cache data<sup>1</sup>.

## So?

When the app in question has hundreds of megabytes of mutable data with complex dependencies and updates, the overhead of managing the cache and the pressure on the garbage collector has a huge impact on the overall performance. And it is one of the most difficult problems in computer science<sup>2</sup>.

## What about other frameworks?

My experience is mostly with React, but I believe all other (accepted) frameworks suffer the same fate. Crank.js is the odd one out, and it would be a massive step forward if it became established. But even Crank.js overcomplicates matters.

## Uh-huh, so what are we left with?

I'm glad you asked that, very little is the answer:

1. A render function<sup>3</sup> that renders markup into the DOM and can perform a partial update for stateful components
2. Observables<sup>4</sup> for conveying changing data between components

## We tried observables, it wasn't great

Those observables bury the concept of time under trilobites of obtuse API. Metalui observables are a simple pub-sub model.

## ...that can't be it

The DOM is fundamentally stateful, and calling the markup declarative is unhelpful<sup>5</sup>. The first render versus subsequent renders are very different, exemplified by scroll position, text input carret and selection, dropdown list state and HTML canvas.

Metalui embraces statefulness by conceptualizing a component as a stateful, independent object<sup>6</sup> that can send signals about data to other components.

## You can probably explain that better, but what is the upshot?

No need for caching, or a virtual DOM, or component lifecycle. Because the arguments to a component function are no longer held hostage by the false premise they are declarative/pure, components are free to receive static data, dynamic data, services or any other context in a normal<sup>7</sup> way. You don't even have to use observables, you could use message passing, or a message queue, or anything else.

## But what are the costs?

Because components are stateful and independent, they can receive updates to data even though the component is no longer required. Imagine a component that is only displayed when there are selected items: when the selected items are cleared the component might receive this update before its parent. Therefore, the component must check that there are selected items, and exit if there are not<sup>8</sup>. Subsequently the parent will rerender and destroy its children.

To avoid needless rerenders, a component must carefully choose what updates to observe on the data. You have to do this in any framework; in React it is done by careful arrangement of reference<sup>9</sup> equality for props, and memoization. Metalui just makes the need and implementation explicit.

Although these rules are tedious, I believe them the lesser of evils and much simpler than all the rules of other frameworks.

## Hmm, we'll see. Bottom line here?

An order of magnitude increase in performance, an order of magnitude decrease in memory usage, and an order of magnitude decrease in bundle size<sup>10</sup>.

## Hang on, I can't use any of my favourite UI components?

No, and that is probably the best reason to put forward not to use metalui. Having said that, the amount of time we've spend customizing and battling some UI component library, and still not got exactly what we want is probably greater than building it from scratch. In my prototype I have used plain HTML and CSS and, with the invention of flexbox and css variables, creating some of the more complex components was actually quite easy. And because all the dependencies have been culled, the UI layer is extremly thin and very transparent.

## Ah, here are the footnotes

<sup>1</sup> I prefer to call it buffering, as caching is an optional optimization in my eyes.

<sup>2</sup> the other being naming

<sup>3</sup> about 100 lines

<sup>4</sup> about 50 lines

<sup>5</sup> a lie

<sup>6</sup> more like smalltalk, but components are still functions

<sup>7</sup> no hooks or algebraic effects

<sup>8</sup> see the docs for concrete examples

<sup>9</sup> not the more useful value equality

<sup>10</sup> a prototype for a significant portion of a complex, stateful application, not a toy example
