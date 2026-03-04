# Activetheory.js (Hydra Framework) - Architecture Documentation

## Overview

**Activetheory.js** is a sophisticated, custom-built JavaScript framework (also known as "Hydra") developed by Active Theory for creating high-performance interactive web experiences. It's a monolithic framework providing its own class system, rendering pipeline, state management, and UI abstractions optimized for creative/agency work involving WebGL, animations, and complex DOM manipulation.

---

## Core Architecture Patterns

### 1. Class System & Inheritance

The framework implements a custom class instantiation system via `window.Class()`:

```javascript
Class(function MyClass() {
    // Constructor
}, "type", staticCallback);
```

**Class Types:**
- **Regular**: `Class(function MyClass() {...})`
- **Static**: `Class(function MyClass() {...}, "Static")` - Immediately instantiated singleton
- **Singleton**: `Class(function MyClass() {...}, "Singleton")` - Lazy singleton with `.instance()` method

**Inheritance:**
- `window.Inherit(child, parent, ...args)` - Prototypal inheritance with super method access
- `window.Namespace(name)` - Organize classes into logical groups

**Key Features:**
- Automatic parent-child relationships via `this.parent`
- Lifecycle management (`init()`, `ready()`, `destroy()`)
- Hot Module Replacement (HMR) support
- Super method calling with automatic name mangling (`_methodName`)

---

### 2. Render Loop & Timing System

#### `Render` (Static Class)
Central rendering engine managing the frame loop:

**Dual-Loop System:**
- `_render[]` - Standard frame-rate callbacks (normalized to 60fps)
- `_native[]` - High-frequency native callbacks with refresh rate multipliers

**Methods:**
- `Render.start(callback, fps)` - Register render callback
- `Render.stop(callback)` - Unregister callback
- `Render.startNative(callback)` - Register native-speed callback

**Features:**
- FPS capping via `Render.capFPS`
- Refresh rate detection (samples at runtime: 30/60/72/90/120/144/240Hz)
- Time scaling support (`Render.TIME_MULT`)
- Per-frame delta time via `Render.DELTA`
- Screen change detection for multi-monitor setups

**Properties:**
- `Render.TIME` - Current timestamp
- `Render.DELTA` - Delta time since last frame
- `Render.REFRESH_RATE` - Detected screen refresh rate
- `Render.HZ_MULTIPLIER` - Normalization multiplier (60 / refresh_rate)
- `Render.FRAME_HZ_MULTIPLIER` - For lerp alpha normalization

#### `Timer` (Static Class)
setTimeout/requestAnimationFrame wrapper:

```javascript
Timer.create(callback, delay) // Returns timer ID
Timer.destroy(id)             // Cancel timer
defer(callback)               // Execute next frame
deferNextTick(callback)       // Execute via postMessage (microtask timing)
```

**Features:**
- Time scaling support (scaled vs unscaled time)
- Dual-buffer defer system to prevent callback queue mutations during iteration

---

### 3. Event System

#### `Events` (Mixed into Components)
Custom event emitter with scoped subscriptions:

```javascript
this.events.sub(obj, 'eventName', callback)  // Subscribe to object event
this.events.unsub(callback)                  // Unsubscribe specific callback
this.events.fire('eventName', data)          // Fire event
```

**Built-in Global Events:**
- `Events.RESIZE` - Window/stage resize
- `Events.VISIBILITY` - Tab visibility change
- `Events.BROWSER_FOCUS` - Browser focus/blur with intelligent detection
- `Events.ONLINE` / `Events.OFFLINE` - Network status
- `Events.BACKGROUND` / `Events.FOREGROUND` - App state
- `Render.RENDER_CALLBACK_ERROR` - Render loop errors

**Architecture:**
- Automatic cleanup on component destruction
- Event linking between parent/child objects
- Local emitters per component to avoid global pollution

---

### 4. Component System

#### `Component` (Base Class)
Core building block for all framework objects:

```javascript
Class(function MyComponent() {
    Inherit(this, Component);
    
    this.init = function() {
        // Initialization
    };
    
    this.ready = function() {
        // After all components initialized
    };
});
```

**Lifecycle Methods:**
- `init()` - Constructor logic
- `ready()` - Called after all components initialized
- `destroy()` - Cleanup (auto-cleanup of timers/events/tweens)

**Render Management:**
- `this.startRender(callback, fps)` - Register render loop
- `this.stopRender(callback)` - Unregister
- Automatic cleanup on destroy

**Timers:**
- `this.delayedCall(callback, delay)` - Scoped timer
- Automatic cleanup on destroy

**State Flags:**
- `this.flag(name)` - Set flag
- `this.unflag(name)` - Clear flag

**Dynamic Properties:**
- `this.set(prop, value)` - Define getter/setter
- `this.get(prop, value)` - Define getter
- `this.wait(prop)` - Returns promise when property becomes truthy

**State Binding:**
- Automatic integration with AppState for reactive data flow

**Parent-Child Hierarchy:**
- Automatic tracking via `__componentClasses`
- Cascading destruction
- Parent finding via `this.parent`

---

### 5. State Management

#### `AppState` (Global State)
Observable state management system:

```javascript
AppState.set('key', value)           // Set state
AppState.get('key')                  // Get state  
AppState.bind('key', callback)       // Subscribe to changes
AppState.unbind('key', callback)     // Unsubscribe
```

**Features:**
- Namespaced keys (`'namespace/key'`)
- Local state objects via `LocalState`
- `StateArray` for reactive arrays
- `AppState.combine()` for computed state from multiple sources

#### `PushState` (Router)
URL-based state management:

```javascript
PushState.setState('route/subroute')
PushState.getState()
PushState.clearState()
```

**Features:**
- Hash-based (`#!`) or HTML5 pushState support
- State change blockers/locks
- Query parameter preservation
- History manipulation

---

### 6. Animation & Tweening

#### `TweenManager` (Global)
Sophisticated animation engine:

**Tween Types:**

1. **JavaScript Tweens** - Direct property manipulation
```javascript
this.tween(obj, {x: 100, y: 200}, 1000, 'easeOutCubic', callback);
```

2. **CSS Tweens** - Hardware-accelerated CSS transitions
```javascript
this.css(obj, {x: 100, y: 200}, 1000, 'easeOutCubic', callback);
```

3. **Frame Tweens** - Manual frame-by-frame animation
```javascript
this.frame(obj, {x: 100}, 1000, 'easeOutCubic', callback);
```

**Easing Functions:**
- Custom easing: `Quint`, `Cubic`, `Expo`, `Linear`, `Sine`, `Back`, `Elastic`, `Bounce`
- Cubic-bezier CSS easing for hardware acceleration
- Easing conversion between JS and CSS

**Transform Handling:**
- Automatic 3D transform matrix composition
- Separate tracking of transform vs regular CSS properties
- `will-change` optimization hints

**Methods:**
- `tween()` - Standard JS tween
- `css()` - CSS transition tween
- `clearTween()` - Cancel tweens
- `getAllTweens(obj)` - Get all active tweens
- `clearTransform(obj)` - Reset transforms

**Architecture:**
- Global tween tracking
- Automatic cleanup on component destroy
- Manual interpolation via `interpolate(obj, prop, value, alpha)`
- Promise-based chaining

---

### 7. DOM Abstraction Layer

#### `Element` (jQuery-like API)
Wrapper around DOM elements:

```javascript
$('.selector')              // Query selector
$obj.create('child', 'div') // Create child element
$obj.css({...})            // Set CSS properties
$obj.transform({x, y, z})   // Apply 3D transforms
$obj.tween({x: 100}, 1000)  // Animate
```

**Key Features:**

**Transform Management:**
- Transform caching and matrix composition
- Properties: `x`, `y`, `z`, `rotation`, `rotationX/Y/Z`, `scale`, `scaleX/Y`
- Automatic `transform3d()` generation

**CSS Handling:**
- Property normalization (vendor prefixes, units)
- Automatic unit injection (px, %, deg, etc.)
- Shorthand support (`bg` → `background`, etc.)

**Event Binding:**
- `interact(callback, type)` - Touch/mouse events
- `click(callback)` - Click events  
- `hover(overCallback, outCallback)` - Hover events
- Automatic cleanup on destroy

**DOM Manipulation:**
- `create(name, type)` - Create child
- `clone()` - Deep clone
- `empty()` - Remove all children
- `remove()` - Remove from DOM
- `destroy()` - Full cleanup

**LinkedList Children:**
- O(1) insertions/removals via LinkedList structure
- `.next`, `.prev` pointers for traversal

**SVG Support:**
- Whitelisted SVG properties
- Special handling for SVG transforms

**Touch/Mouse Abstraction:**
- Unified touch/mouse event handling
- Multi-touch support with touch ID tracking
- Velocity and delta tracking
- Click prevention system

---

### 8. Module System

#### `Module` / `Modules` (Static)
AMD-like module system:

```javascript
Module(function() {
    this.module = 'name';
    this.path = 'subpath';
    this.exports = {
        // Exported API
    };
});

let mod = Modules.require('name/subpath');
```

**Features:**
- Lazy execution (modules execute on first require)
- Module readiness promises via `Modules.ready()`
- Constructor tracking for dynamic instantiation
- Namespace support

---

### 9. Asset Management

#### `Assets` (Static)
Centralized asset loading:

```javascript
Assets.loadImage(path)
Assets.loadVideo(path)
Assets.loadData(path)
Assets.getPath(path)         // CDN + resolution handling
```

**Asset Storage:**
- `Assets.IMAGES` - Image cache
- `Assets.VIDEOS` - Video cache
- `Assets.JSON` - JSON data cache

**Features:**

**Multi-Resolution Support:**
- Automatic 1x/2x/3x selection based on `devicePixelRatio`
- Path suffix injection (`image@2x.jpg`)

**CDN Management:**
- `Assets.CDN` prefix for all assets
- Path replacement/dictionary for asset organization

**Format Detection:**
- WebP detection and automatic format switching
- Fallback to JPEG/PNG on WebP unsupported

**Batch Loading:**
- `AssetLoader` class for batch loading
- Progress events
- Promise-based completion

**Image Decoding:**
- Async image decode support (`img.decode()`)
- Fallback to UV placeholder on error

---

### 10. Device Detection

#### `Device` (Static)
Comprehensive device/browser detection:

```javascript
Device.system.os              // 'ios', 'android', 'mac', 'windows', 'linux'
Device.system.browser         // 'chrome', 'safari', 'firefox', 'edge', etc.
Device.system.version         // Browser version
Device.mobile.phone           // Boolean
Device.mobile.tablet          // Boolean
Device.media.audio            // Audio format support
Device.media.video            // Video format support
```

**Graphics Detection:**
```javascript
Device.graphics.webgl         // WebGL context
Device.graphics.webgl2        // WebGL 2.0 support
Device.graphics.gpu           // GPU name (via WEBGL_debug_renderer_info)
Device.graphics.extensions    // WebGL extensions
```

**Feature Detection:**
- `Device.system.retina` - High DPI display
- `Device.tween.transition` - CSS transition support
- `Device.tween.css2d/css3d` - CSS transform support
- Context loss detection and handling

---

### 11. Mobile-Specific Features

#### `Mobile` (Static)
Mobile-first utilities:

**Safe Area Insets:**
- CSS custom properties for notch handling
- `--sat`, `--sal`, `--sar`, `--sab` (top, left, right, bottom)

**Orientation Locking:**
```javascript
Mobile.orientation.lock('portrait')
Mobile.orientation.unlock()
```

**Viewport Fixes:**
- iOS 100vh fix (actual viewport height)
- Dynamic viewport height updates

**Scroll Management:**
- `Mobile.overscroll.prevent()` - Prevent rubber-banding
- `Mobile.overscroll.allow(selector)` - Allow native scroll in specific areas

**Other Features:**
- `Mobile.vibrate(duration)` - Haptic feedback
- `Mobile.fullscreen.enter/exit()` - Android fullscreen
- Keyboard height detection

---

### 12. Input Systems

#### `Interaction` (Class)
Low-level input handling:

```javascript
let input = new Interaction(element);
input.events.sub(Interaction.START, callback);
input.events.sub(Interaction.MOVE, callback);
input.events.sub(Interaction.END, callback);
```

**Features:**
- Touch ID tracking for multi-touch
- Velocity calculation
- Distance moved tracking (`input.distance`)
- Hit testing with object binding
- Prevent default handling

**Event Properties:**
```javascript
e.x, e.y           // Screen coordinates
e.object           // Bound object
e.touchId          // Touch identifier
```

#### `Mouse` (Static Singleton)
Global mouse tracking:

```javascript
Mouse.x, Mouse.y              // Screen coordinates
Mouse.normal                  // Normalized {x: 0-1, y: 0-1}
Mouse.tilt                    // Tilt {x: -1 to 1, y: -1 to 1}
Mouse.velocity                // Movement velocity
```

**Methods:**
- `Mouse.capture(obj, distance)` - Bind object to mouse
- `Mouse.release(obj)` - Unbind object

#### `Keyboard` (Static)
Keyboard state tracking:

```javascript
Keyboard.pressing[]           // Currently pressed keys by code
Keyboard.events.sub(Keyboard.DOWN, callback)
Keyboard.events.sub(Keyboard.UP, callback)
Keyboard.events.sub(Keyboard.PRESS, callback)
```

---

### 13. Utilities

#### `Utils` (Static)
Extensive utility library:

**Query Parameters:**
```javascript
Utils.query(key)              // Get query param
Utils.queryURL(key, url)      // Parse from URL
```

**Object Manipulation:**
```javascript
Utils.cloneObject(obj)        // Deep clone
Utils.mergeObject(a, b)       // Deep merge
Utils.toObject(key, value)    // Create nested object from dot notation
```

**String Utilities:**
```javascript
Utils.basename(path)          // Get filename
Utils.extension(path)         // Get extension
Utils.timestamp()             // Current timestamp string
```

**UUID & Random:**
```javascript
Utils.uuid()                  // Generate UUID
Utils.headlessRandom()        // Deterministic random
```

**Clipboard:**
```javascript
Utils.copy(text)              // Copy to clipboard
Utils.read()                  // Read from clipboard (async)
```

**Other:**
```javascript
Utils.debounce(callback, time, data)
Utils.formatNumber(value)     // Add commas
Utils.replaceAll(str, find, replace)
```

**Math Extensions:**
```javascript
Math.rand(min, max, precision)
Math.degrees(radians)
Math.radians(degrees)
Math.clamp(value, min, max)
Math.lerp(target, value, alpha)
Math.smoothStep(value, min, max)
```

**Array Extensions:**
```javascript
Array.prototype.shuffle()     // Randomize array
Array.storeRandom(arr)        // Store original order
Array.restoreRandom(arr)      // Restore original order
```

**String Extensions:**
```javascript
String.prototype.includes(search)
String.prototype.clip(len, end)  // Truncate with ellipsis
```

---

### 14. CSS Management

#### `HydraCSS` (Static)
Dynamic CSS injection:

```javascript
HydraCSS.style('.selector', {
    width: 100,
    backgroundColor: '#000',
    transform: 'translateX(10px)'
});
```

**Features:**
- Automatic camelCase to kebab-case conversion
- Unit injection (px, %, deg, etc.)
- Runtime stylesheet manipulation
- `!important` injection for overrides
- Style tag management

---

### 15. Fragment/Component System

#### `Fragment` (Base Class)
Higher-level component architecture for UI:

```javascript
Class(function MyFragment() {
    Inherit(this, Fragment);
    
    this.fragName = 'myComponent';
    
    this.$set('key', value);       // Set local state
    this.$get('key');              // Get with auto-wait
    this.$bind('key', callback);   // Bind to state changes
    this.$fire('key', value);      // Fire state event
});
```

**Features:**

**Namespaced State:**
- `FragmentState` provides isolated state per fragment
- Automatic state cleanup on destroy

**Data Handling:**
- `this.onRequest(key, callback)` - Register data request handler
- `this.request(frag, key, value)` - Request data from other fragments

**Shortcuts:**
- `this.initUI(prefix)` - Auto-initialize UI elements
- `this.initGL(prefix)` - Auto-initialize GL objects
- `this.initLayer(name, type)` - Layer management

#### `UI` (Class)
Template-based UI rendering:

```javascript
Class(function MyUI() {
    Inherit(this, UI);
    
    this.render = function(html) {
        return html`
            <div>
                ${this.data.map(item => html`<span>${item}</span>`)}
            </div>
        `;
    };
});
```

**Features:**
- Tagged template literals for HTML/CSS
- Dynamic style injection
- Hot reload support in development
- Async rendering with worker
- Automatic element creation

---

## Advanced Features

### Data Binding System
- Two-way binding via `DataBinding`
- Conditional rendering based on AppState
- 3D object initialization tied to state

### Polyfills & Browser Compatibility
- `fetch()`, `Promise` polyfills
- `Math` extensions (`Math.sign`, `Math.fract`, etc.)
- Array/String extensions
- `CustomEvent` polyfill
- `WeakRef` polyfill for older browsers
- Custom `fetch` implementation for `file://` protocol

### Performance Optimizations
- Object pooling via `ObjectPool`
- LinkedList for O(1) insertions/removals
- Transform caching to avoid matrix recalculation
- `will-change` CSS hints
- Deferred operations to avoid layout thrashing
- Render callback batching

### Development Tools
- HMR (Hot Module Replacement) support
- Component instance tracking
- Error boundary system
- Local environment detection (`Hydra.LOCAL`)
- UIL socket integration for live updates
- Stack trace parsing for debugging

---

## Initialization Flow

1. **Polyfills**: Browser compatibility shims applied
2. **Class System**: `window.Class()` and inheritance setup
3. **Hydra Core**: Main singleton initialization
4. **Events**: Global event emitter setup
5. **Stage**: DOM container creation (`#Stage`)
6. **Device Detection**: Browser/OS/GPU profiling
7. **Render Start**: Frame loop begins via `requestAnimationFrame`
8. **Ready Callbacks**: `Hydra.ready()` queue execution
9. **Module Loading**: Lazy module initialization
10. **Component Tree**: User code instantiation

---

## Key Design Decisions

1. **Monolithic Approach**: Everything in one file for zero-dependency deployment and fast loading
2. **Custom Class System**: Avoids ES6 class limitations, adds lifecycle hooks and better inheritance
3. **Dual Render Loop**: Separates high-frequency physics (native) from standard rendering
4. **Transform Matrix Caching**: Reduces CPU overhead for frequent DOM transform updates
5. **State-Driven Architecture**: Centralized AppState for reactive UI patterns
6. **Mobile-First**: Extensive mobile browser quirk handling (iOS safari, notches, etc.)
7. **Performance-Oriented**: Object pools, LinkedLists, batched updates, transform caching
8. **Flexible Tweening**: JS/CSS/Manual modes for different performance/quality tradeoffs
9. **Framework Agnostic**: Can work alongside React, Vue, or standalone

---

## Use Cases

Activetheory/Hydra is optimized for:
- **High-performance WebGL experiences** (Three.js, Pixi.js integration)
- **Complex DOM animations** (parallax, scroll-driven effects)
- **Multi-platform deployment** (web, mobile web, native wrappers)
- **State-driven reactive UIs** (SPAs, dynamic content)
- **Advanced input handling** (multi-touch, gestures, keyboard)
- **Interactive storytelling** (agency/portfolio websites)
- **Award-winning creative experiences** (FWA, Awwwards sites)

---

## Comparison to Other Frameworks

| Feature | Activetheory/Hydra | PixiJS + GSAP + Redux + React |
|---------|-------------------|------------------------------|
| File Size | ~200KB minified | ~500KB+ combined |
| Class System | Custom with lifecycle | ES6 classes |
| Rendering | Dual-loop (60fps + native) | Single RAF loop |
| State | Built-in AppState | Redux or Context |
| Tweening | JS/CSS/Frame modes | GSAP only |
| DOM | Element wrapper | React/native DOM |
| Mobile | Extensive quirk handling | Limited |
| Learning Curve | Framework-specific | Industry standard |

---

## Example Usage Patterns

### Basic Component
```javascript
Class(function Hero() {
    Inherit(this, Component);
    
    let $container;
    
    this.init = function() {
        $container = $('.hero');
        this.startRender(loop);
        this.events.sub(Events.RESIZE, resize);
    };
    
    function loop(t, dt) {
        // Animation loop
    }
    
    function resize() {
        // Handle resize
    }
});
```

### State Management
```javascript
AppState.set('user/logged-in', true);
AppState.bind('user/logged-in', (loggedIn) => {
    console.log('User login state:', loggedIn);
});
```

### Animation
```javascript
let $el = $('.box');
$el.tween({ x: 100, y: 200, scale: 1.2 }, 1000, 'easeOutQuint', () => {
    console.log('Animation complete');
});
```

---

## Conclusion

**Activetheory.js (Hydra)** is an enterprise-grade creative framework engineered for production-level interactive web experiences. The architecture reflects years of battle-testing at Active Theory, with sophisticated solutions for:

- Cross-browser compatibility and mobile quirks
- Performance optimization (60fps+ even on mobile)
- Developer ergonomics (HMR, debugging tools)
- Flexible rendering pipeline (DOM, WebGL, hybrid)
- Advanced input handling and state management

It's essentially a **full-stack creative framework** that combines rendering, animation, state, and DOM manipulation into one optimized package for high-performance interactive storytelling.

---

*Documentation reverse-engineered from minified Activetheory.js v[version unknown]*
*Framework developed by Active Theory (activetheory.net)*
