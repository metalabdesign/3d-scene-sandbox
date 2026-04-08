# Lesson 3: Click-to-Rotate — Raycasting & Per-Object Animation

## The Problem

The entire Three.js scene is **one `<canvas>` element**. When you click, the browser only knows "the canvas was clicked at pixel (450, 320)" — it has no idea which 3D object is under that pixel.

## The Solution: Raycasting

Raycasting shoots an invisible ray from the camera through a point on the screen and checks what 3D objects it hits.

```
Camera ──── ray ─────→ [hits Box A] ──→ [hits Box B behind it]
              ↑
        mouse position
        (converted to NDC)
```

Three.js returns a sorted list of all intersections — closest first.

### Step-by-step:

**1. Convert mouse pixels → Normalized Device Coordinates (NDC)**

Screen pixels have (0,0) at top-left. Three.js needs coordinates from -1 to +1:

```js
pointer.x =  (event.clientX / window.innerWidth)  * 2 - 1;
pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;  // Y is flipped!
```

| Pixel position | NDC |
|---|---|
| Top-left (0, 0) | (-1, +1) |
| Center | (0, 0) |
| Bottom-right | (+1, -1) |

**2. Create the ray**

```js
raycaster.setFromCamera(pointer, camera);
```

This does heavy matrix math internally — it "unprojects" the 2D point back into 3D space using the camera's projection matrix.

**3. Test for intersections**

```js
const intersects = raycaster.intersectObjects(blocksGroup.children, false);
```

Returns an array of `{ object, point, distance, face, ... }`. We use `intersects[0].object` to get the closest mesh.

## userData — Custom Per-Object State

Every Three.js object has a `.userData` property (an empty object `{}` by default). You can store anything there:

```js
mesh.userData.spinning = true;
mesh.userData.spinAxis = 'y';
mesh.userData.spinSpeed = 0.03;
```

**Why this is great:**
- No need for external Maps or parallel arrays
- State travels with the object — if you remove the mesh, the state goes with it
- Multiple systems can store different data without conflicts

## Random Axis Selection

When clicked, each box picks a random axis:

```js
const axes = ['x', 'y', 'z'];
mesh.userData.spinAxis = axes[Math.floor(Math.random() * 3)];
```

Then in the animation loop:

```js
mesh.rotation[axis] += speed;
```

This works because `mesh.rotation` is an `Euler` object with `.x`, `.y`, `.z` properties, and JavaScript allows bracket notation to access them dynamically.

## The Animation Loop — Now With Work

The loop now iterates over all blocks each frame:

```js
blocksGroup.children.forEach((mesh) => {
  if (mesh.userData.spinning) {
    mesh.rotation[mesh.userData.spinAxis] += mesh.userData.spinSpeed;
  }
});
```

At 60fps with 80 blocks (8x10), this runs 80 iterations per frame — trivial for the CPU.

## Toggle Behavior

Clicking a spinning block **stops** it. Clicking a stopped block starts it on a **new random axis**. This is done with a simple boolean toggle on `userData.spinning`.

## Performance Note

Raycasting tests every child mesh against the ray. With 80 blocks this is instant, but for scenes with thousands of objects you'd want:
- **Spatial partitioning** (octrees) — only test nearby objects
- **Layers** — `raycaster.layers` can skip certain objects
- **Bounding sphere pre-check** — cheap test before expensive triangle tests

For our use case, none of this is needed.

## What You Should See

Click any block — it starts spinning on a random axis (X, Y, or Z). Click it again to stop. Multiple blocks can spin simultaneously, each on their own axis.

## Next Step
→ [Lesson 4: Configuration Panel](./04-config-panel.md) — Add a toggleable UI overlay to tweak settings live.
