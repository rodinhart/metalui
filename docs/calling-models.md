# Calling models

**note** beware of analogies

Imagine working in a deli, taking orders which needs preparing in the kitchen. A customer has just ordered a toastie.

## Sync call

You go into the kitchen, make the toastie, walk out of the kitchen and serve the toastie to the customer.

## Async blocking call

You write the order down, place the piece of paper on the counter and wait. At some point a chef picks up the order, makes the toastie and places it on the counter. You serve the toastie to the customer.

Note that this very much depends on another person being available in the kitchen, and that person is not waiting on you, otherwise you'll be waiting forever.

### Multithreading

The chef is definitely a diffent person (i.e. not you), because you're busy waiting for the order. It could be a different person each time you put an order down though.

### Single threading

**note** I'm not sure there are single treaded, blocking languages in existence.

The deli remembers who you are and what you were doing, and then completely clears your brain! The whole deli, except you, revolves 180 degrees, so you are now ion the kitchen. The deli uploads the chef program into your brain and kickstarts you. You pick up the order, prepare it, and place it on the counter. The deli clears your brain again, revolses 180 degrees again and restores who you are and what you were doing. You serve the order to the customer.

## Async non-blocking call

You put the order down on the counter and continue waiting for customers to place orders.

### Single threading

At some point there are no customers waiting to place orders. In this idle time you go into the kitchen, pick up orders, prepare them, and place them on the counter. At any point after finishing an order, you might walk out of the kitchen to take orders from customers again.

### Multithreading

**note** I'm not sure there are multithreaded, non-blocking languages in existence. C# has both blocking and non-blocking semantics, but I think they apply in difference contexts, desktop and web applications respectively?

A chef picks up your order, makes the toastie, and calls you back to serve it to the customer. However, it _could_ be yourself making the toastie should you become idle.
