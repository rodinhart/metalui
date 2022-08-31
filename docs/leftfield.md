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
const filename = "hello.txt"
let hello
readFile(filename, (result) => {
  hello = result
})
```

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
