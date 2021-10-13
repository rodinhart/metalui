- tests!
- fix react-bridge
- forms (9. Forms)

  - rerendering at wrong level
  - do we need controlled components?
    - pro would be disallowing certain characters in input
      - can be done with preventDefault onkeypress
    - or putting thousands separators in while typing

- await notify?
  - because components are async, and cannot send signal back, you can't tell whether components is alive but pending, or dead
  - hence you can't know whether to notify is done or not
- allow style = {} ?
- put warning/errors where sensible
- API docs
  - Fragment
  - lazyLoad
  - Observable
  - race
  - render
  - Scroller
  - document typing?
  - add types?
- Live code sandbox?
- react bridge: allow () => <div>Hello</div> components?
- What is errorBoundary need render and/or throws error?
- ǃ (special char)
- a event wrapper library for cross browser compatibility?

## Notes

- https://dev.to/robbiegm/design-principles-of-crank-js-and-react-2e6k
