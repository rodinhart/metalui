## single threading

More useful than single threading might be to call it single program state. There only one point where code is running at any one time. The runtime environment has no way of remembering the current program state, no way to switch to another.

### non-blocking event-driven

```txt
on event
  do await IO
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

In the above example the callback handler closes over some program state (`addition`). Also, when doing something with `helloworld` we are now (at least) nested one level.

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

Instead of adding handlers to various events, we could imagine a system where we explicitly poll for events.

```txt
while not quit
  await poll event
  if event do await IO
```

There is now more control over when and how events are handled, the code can be structured any way we like. We know for instance we are handling only one event at a time. This could be a disadvantage as we might be blocking the user. It could be an advantage as we might batch event handling, or only debounce event, thus reduce CPU load.

### blocking polling

Now that our code is sequential, and we don't rely on switching program state, we can imagine a blocking version.

```txt
while not quit
  poll event
  on event do IO
```

Both polling and performing IO blocks execution, the program just waits until the result is ready. Of course, that means some other process is doing some work. Blocking implies multitasking at a lower level, perhaps in the runtime or even on the OS or hardware level.
