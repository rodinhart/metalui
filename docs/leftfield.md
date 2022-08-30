## single threading

More useful than single threading might be to call it single program state. There only one point where code is running at any one time. The runtime environment has no way of remembering the current program state, no way to switch to another.

## non-blocking (e.g. JavaScript)

```txt
on event
  await IO
```

JavaScript is an event-driven language, which essentially means you set up your application after which it sits there listening for events. Your program isn't running as such, but it can be called back through as many endpoints as there are event types.


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
