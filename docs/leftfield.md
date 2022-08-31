## single threading

More useful than single threading might be to call it single program state. There only one point where code is running at any one time. The runtime environment has no way of remembering the current program state, no way to switch to another.

### non-blocking event-driven

```txt
on event
  await IO
```

JavaScript is an event-driven language, which essentially means you set up your application after which it sits there listening for events. Your program isn't running as such, but it can be called back through as many endpoints as there are event types. One consequence is that the resulting code structure is somewhat dictated by the structure of the events. In particular, the code won't read sequentially and some work is needed to share state.

When certain operations, like IO, are performed where the runtime has to wait for a result, non-blocking means the program ends execution, and is called back when the result is ready. If any state needs to be carried across, it is up to the programmer to arrange this. Mostly this is done using closures.

```js
// some program state
const filename = "hello.txt"
const addition = "World"

readFile(filename, (result) => {
  const helloworld = result + addition
  
  // do something with helloworld
})
```

In the above example the callback handler closes over some program state (`addition`).

Most languages now provide contructs to make callback more palatable.

```js
// some program state
const filename = "hello.txt"
const addition = "World"

const result = await readFile(filename)
const helloworld = result + addition

// do something with helloworld
```

Clearly the code now at least _looks_ sequential. It isn't entirely clear (to me) whether this is just syntactic sugar, and this is transformed to closures, or the runtime actually captures the program state somehow, to be restored later on.

### non-blocking polling

```txt
while not quit
  await poll event
  if event await IO
```




```txt
while not quit
  poll event
  on event do IO
```

```txt
```
