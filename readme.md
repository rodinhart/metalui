# metalui

An anti-framework

## FFS, not another one?

I'm afraid so...

## What's wrong with React?

An awful lot, but most importantly, the render function in React is sync[^1] while JavaScript is fundamentally async. To bridge this impedance mismatch one is forced to cache data.

[^1] or blocking and non-blocking if you like
