# Calling models

**note** beware of analogies

Imagine being in a pub, talking to your friends and watching the world chess final on the TV. In your hand you're holding a beer glass, and notice it is empty.

## Sync call

You walk around to the other side of the bar, pour yourself a beer from the tap, walk back around the bar and continue your evening.

## Async blocking call

You put your glass on the bar and wait. At some point a bartender pick up the glass, fill it with beer and places it back on bar. You pick it up and continue your evening.

Note that this very much depends on another person being available behind that bar, and that person not waiting on you, otherwise you'll be waiting forever.

### Multithreading

The bartender is definitely a different person (i.e. not you), because you're busy waiting for your beer. It could be a different person each time you go for a refill though.

### Single threading

**note** I'm not sure there are single treaded, blocking languages in existence.

The pub remember who you are and what you were doing, and then completely clears your brain! The whole pub, except you, revolves 180 degrees, so you are now behind the bar. The pub uploads the bartender program into your brain and kickstarts you. You start filling any glasses on the bar with beer. At some point, the pub clears your brain again, revolses 180 degress again and restores who you are and what you were doing. You pick up your filled glass and continue your evening.

## Async non-blocking call

You put your glass on the bar and go back to your friends. At some point the bartender calls you back and you retrieve your now full glass from the bar and continue your evening.

### Single threading

At some point there is nobody to talk to, and nothing on TV. In this idle time you go behind the bar and pour a few beers, after which you go back to your friends.

### Multithreading

**note** I'm not sure there are multithreaded, non-blocking languages in existence. C# has both blocking and non-blocking semantics, but I think they apply in difference contexts, desktop and web applications respectively?

Somebody fills your glass with beer and call you back, but it could be yourself should you be idle.
