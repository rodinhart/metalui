# metalui

An anti-framework

## FFS, not another one?

I'm afraid so...

## What's wrong with React?

An awful lot, but most importantly, the render function in React is sync<sup>1</sup> while JavaScript is fundamentally async. To bridge this impedance mismatch one is forced to cache data<sup>2</sup>.

## So?

When the app in question has hundreds of megabytes of data with complex dependencies and updates, the overhead of managing the cache and the pressure on the garbage collector has a huge impact on the overall performance. And it is one of the most difficult problems in computer science<sup>3</sup>.

## What about other frameworks?

My experience is mostly with React, but I believe all other (accepted) frameworks suffer the same fate. Crank.js is the odd one out, and it would be a massive step forward if it became established. But even Crank.js overcomplicates matters.

## Uh-huh, so what are we left with?

I'm glad you asked that, very little is the answer:

1. A render function<sup>4</sup> that renders markup into the DOM and can perform a partial update for stateful components
2. Observables<sup>5</sup> for conveying changing data between components

## We tried observables, it wasn't great

Those observables bury the concept of time under trilobites of obtuse API. Metalui observables are a simple pub-sub model.

## ...that can't be it

The DOM is fundamentally stateful, and calling the markup declarative is unhelpful<sup>6</sup>. The first render versus subsequent renders are very different, exemplified by scroll position, text input carret and selection, dropdown state and HTML canvas.

Metalui embraces statefulness by conceptualizing a component as a stateful, independent object<sup>7</sup> that can send signals about data to other components.

## You can probably explain that better, but what is the upshot?

No need for caching, or a virtual DOM. Because the arguments to a component function are no longer held hostage by the false premise they are declarative/pure, components are free to receive static data, dynamic data, services or any other context in a normal<sup>8</sup> way.

## Ah, here are the footnotes

<sup>1</sup> or blocking and non-blocking if you like

<sup>2</sup> I prefer to call it buffering, as caching is an optional optimization in my eyes.

<sup>3</sup> the other being naming

<sup>4</sup> about 100 lines

<sup>5</sup> about 50 lines

<sup>6</sup> a lie

<sup>7</sup> more like smalltalk, but components are still functions

<sup>8</sup> no hooks or algebraic effects
