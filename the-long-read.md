# The Long Read

## sketches

`{ data } = useQuery(...)` smells of concurrency, competing for query engine and rendering

multiple passes of the render function now leads to useMemo use.
