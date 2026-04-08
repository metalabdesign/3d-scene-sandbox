# Lesson 2: Generative Grid — Placing Multiple Boxes

## The CONFIG Pattern

Instead of scattering magic numbers, we put all tweakable values in one object:

```js
const CONFIG = {
  rows: 8,
  cols: 10,
  gap: 0.15,
  blockHeight: { min: 1, max: 6 },
  palette: ['#e63946', '#f4a261', ...],
};
```

**Why this matters:**
- One place to read all settings
- Easy to hook up UI controls later
- You can serialize/share configs as JSON
- Functions read from `CONFIG` instead of taking dozens of parameters

## THREE.Group — Organizing Objects

A `Group` is an invisible container:

```js
const group = new THREE.Group();
group.add(mesh1);
group.add(mesh2);
scene.add(group);
```

**Key uses:**
- **Batch operations:** Remove all blocks at once with `scene.remove(group)`
- **Relative transforms:** Moving the group moves all children
- **Organization:** Like folders for your 3D objects

## The Generation Loop

We use nested `for` loops to create a grid:

```
for each row:
  for each col:
    → create a box with random size
    → pick a random color
    → position it in the grid
    → add to group
```

### Positioning math

Each block sits at:
- **X** = `col * spacing - offset` (left to right, centered)
- **Y** = `height / 2` (so the bottom sits on the "ground")
- **Z** = `row * spacing - offset` (front to back, centered)

The offset (`totalSize / 2`) centers the whole grid around the origin (0,0,0), which is where the camera is looking.

### Why Y = height/2?

By default, a `BoxGeometry` is centered at its position. A box at Y=0 with height=4 would extend from Y=-2 to Y=2 (half underground). Setting Y to `height/2` shifts it up so the bottom face sits at Y=0.

## Memory Management: dispose()

Three.js allocates GPU memory for geometry and materials. When removing objects, you **must** call `.dispose()` to free that memory:

```js
group.traverse((child) => {
  if (child.isMesh) {
    child.geometry.dispose();
    child.material.dispose();
  }
});
```

**`.traverse()`** walks through every descendant in the group (like `forEach` for a tree structure). Without this cleanup, regenerating blocks would leak GPU memory.

## Randomization Helpers

Two tiny functions power the variety:

```js
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
```

- `rand(1, 6)` → random float between 1 and 6 (for block height)
- `pick(palette)` → random color from the palette array

## What You Should See

A colorful grid of blocks — like a tiny abstract city. Each block has:
- Random width, height, and depth
- A random color from the Mondrian-style palette
- Neat grid spacing

Refresh the page to get a different random arrangement each time.

## Next Step
→ [Lesson 3: Click-to-Rotate](./03-click-to-rotate.md) — Make blocks spin when you click them.
