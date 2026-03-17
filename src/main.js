import * as THREE from 'three'
import { AsylumMap, FLOORS } from './AsylumMap.js'

// ═══════════════════════════════════════════════════════════════
// main.js — Ravenwood Asylum
//
// Features:
//   WASD        — move
//   Mouse       — look
//   F           — toggle flashlight
//   E           — interact / open door (within 3m)
//   Tab         — toggle layout editor overlay
//   Editor:     Arrow keys / IJKL move room
//               [ ]  shrink/grow width
//               - =  shrink/grow depth
//               , .  prev/next room
//               R    rebuild map with current edits
//               X    export edited layout to console
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// Scene
// ─────────────────────────────────────────────
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x050505)
scene.fog = new THREE.FogExp2(0x050505, 0.025)

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 200)
camera.position.set(0, FLOORS.ground + 1.7, -5)   // Main Entrance spawn

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(devicePixelRatio)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.domElement.addEventListener('click', () => {
  if (!editorOpen) renderer.domElement.requestPointerLock()
})
document.body.appendChild(renderer.domElement)

function resize() {
  renderer.setSize(innerWidth, innerHeight, false)
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
}
resize()
addEventListener('resize', resize)

// ─────────────────────────────────────────────
// Map
// ─────────────────────────────────────────────
const map = new AsylumMap(scene)
map.build()

// ─────────────────────────────────────────────
// Doors
// ─────────────────────────────────────────────
// Each door: { mesh, pivot, open, angle, targetAngle, pos(Vector3) }
// Doors are registered by AsylumMap via map.doors[]
// We animate them every frame toward targetAngle

const DOOR_SPEED = 3.5   // radians per second swing speed

function buildDoors() {
  // AsylumMap registers door specs: { x, z, floorY, facing:'n'|'s'|'e'|'w', width }
  // We build the Three.js meshes here so main.js controls animation
  if (!map.doorSpecs) return
  for (const spec of map.doorSpecs) {
    const doorGroup = new THREE.Group()
    const w = spec.width || 1.8
    const h = 2.8
    const t = 0.08

    // Door panel — pivot is at one edge (hinge side)
    const geo  = new THREE.BoxGeometry(w, h, t)
    // Shift geometry so pivot is at x=0 edge
    geo.translate(w / 2, 0, 0)
    const mat  = map.MAT.door
    const panel = new THREE.Mesh(geo, mat)
    panel.castShadow = true

    // Frame pieces
    const frameMat = map.MAT.wainscot
    const fT = 0.12
    // Top bar
    const topGeo = new THREE.BoxGeometry(w + fT * 2, fT, fT)
    const top = new THREE.Mesh(topGeo, frameMat)
    top.position.set(w / 2, h / 2 + fT / 2, 0)
    // Side bars
    const sideGeo = new THREE.BoxGeometry(fT, h + fT, fT)
    const sideL = new THREE.Mesh(sideGeo, frameMat)
    sideL.position.set(-fT / 2, 0, 0)
    const sideR = new THREE.Mesh(sideGeo, frameMat)
    sideR.position.set(w + fT / 2, 0, 0)

    doorGroup.add(panel, top, sideL, sideR)

    // Position the pivot at hinge corner
    const fy = spec.floorY + h / 2
    if (spec.facing === 'n' || spec.facing === 's') {
      doorGroup.position.set(spec.x - w / 2, fy, spec.z)
      doorGroup.rotation.y = spec.facing === 's' ? 0 : Math.PI
    } else {
      doorGroup.position.set(spec.x, fy, spec.z - w / 2)
      doorGroup.rotation.y = spec.facing === 'e' ? -Math.PI / 2 : Math.PI / 2
    }

    // Store base rotation so we can add swing angle on top
    const baseY = doorGroup.rotation.y
    doorGroup.userData.baseY = baseY

    scene.add(doorGroup)
    map.doors.push({
      group:       doorGroup,
      open:        false,
      angle:       0,
      targetAngle: 0,
      pos:         new THREE.Vector3(spec.x, spec.floorY + 1.4, spec.z),
      facing:      spec.facing,
      width:       w,
      baseY:       baseY
    })
  }
}
buildDoors()

// ─────────────────────────────────────────────
// Input
// ─────────────────────────────────────────────
const keys = {}
addEventListener('keydown', e => {
  keys[e.code] = true
  handleEditorKey(e)
  if (e.code === 'KeyE') tryOpenDoor()
  if (e.code === 'Tab') { e.preventDefault(); toggleEditor() }
  if (e.code === 'KeyF') {
    flashlightOn = !flashlightOn
    flashlight.intensity = flashlightOn ? FLASHLIGHT_INTENSITY : 0
  }
})
addEventListener('keyup', e => keys[e.code] = false)

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== renderer.domElement)
    Object.keys(keys).forEach(k => keys[k] = false)
})

// ─────────────────────────────────────────────
// Mouse look
// ─────────────────────────────────────────────
let yaw = 0, pitch = 0
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement === renderer.domElement) {
    yaw   -= e.movementX * 0.002
    pitch -= e.movementY * 0.002
    pitch  = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch))
  }
})

// ─────────────────────────────────────────────
// Flashlight
// ─────────────────────────────────────────────
const FLASHLIGHT_INTENSITY = 10000
const FLASHLIGHT_DISTANCE  = 10000
const FLASHLIGHT_ANGLE     = 10.38
const FLASHLIGHT_PENUMBRA  = 50.45

const flashlight = new THREE.SpotLight(
  0xfff5e0, FLASHLIGHT_INTENSITY, FLASHLIGHT_DISTANCE,
  FLASHLIGHT_ANGLE, FLASHLIGHT_PENUMBRA, 1.5
)
flashlight.castShadow = true
flashlight.shadow.mapSize.set(512, 512)
flashlight.shadow.camera.near = 0.1
flashlight.shadow.camera.far  = FLASHLIGHT_DISTANCE

const flashlightTarget = new THREE.Object3D()
camera.add(flashlight)
camera.add(flashlightTarget)
flashlight.position.set(0.2, -0.15, 0)
flashlightTarget.position.set(0, 0, -1)
flashlight.target = flashlightTarget
scene.add(camera)

let flashlightOn = true

// ─────────────────────────────────────────────
// Door interaction — press E within 3m
// ─────────────────────────────────────────────
function tryOpenDoor() {
  if (editorOpen) return
  const REACH = 3.0
  for (const door of map.doors) {
    const dist = camera.position.distanceTo(door.pos)
    if (dist < REACH) {
      door.open = !door.open
      door.targetAngle = door.open ? Math.PI * 0.45 : 0
    }
  }
}

// ─────────────────────────────────────────────
// Layout Editor
// ─────────────────────────────────────────────
let editorOpen    = false
let editorRoomIdx = 0
const editorOverlay = document.getElementById('editor-overlay')
const editorInfo    = document.getElementById('editor-info')

function toggleEditor() {
  editorOpen = !editorOpen
  editorOverlay.style.display = editorOpen ? 'flex' : 'none'
  if (editorOpen) {
    document.exitPointerLock()
    updateEditorUI()
  } else {
    renderer.domElement.requestPointerLock()
  }
}

function updateEditorUI() {
  if (!editorOpen) return
  const rooms = map.editableRooms
  if (!rooms || rooms.length === 0) {
    editorInfo.innerHTML = '<span style="color:#f88">No editable rooms registered.</span>'
    return
  }
  const r = rooms[editorRoomIdx]
  editorInfo.innerHTML = `
    <div class="ed-title">Room ${editorRoomIdx + 1} / ${rooms.length}</div>
    <div class="ed-name">${r.name}</div>
    <div class="ed-row"><span class="ed-label">X</span><span class="ed-val">${r.x.toFixed(1)}</span></div>
    <div class="ed-row"><span class="ed-label">Z</span><span class="ed-val">${r.z.toFixed(1)}</span></div>
    <div class="ed-row"><span class="ed-label">W</span><span class="ed-val">${r.w.toFixed(1)}</span></div>
    <div class="ed-row"><span class="ed-label">D</span><span class="ed-val">${r.d.toFixed(1)}</span></div>
    <div class="ed-row"><span class="ed-label">Floor</span><span class="ed-val">${r.floorY.toFixed(1)}</span></div>
    <div class="ed-row"><span class="ed-label">H</span><span class="ed-val">${(r.h||4.2).toFixed(1)}</span></div>
  `
}

const MOVE_STEP   = 0.5
const RESIZE_STEP = 0.5

function handleEditorKey(e) {
  if (!editorOpen) return
  const rooms = map.editableRooms
  if (!rooms || rooms.length === 0) return
  const r = rooms[editorRoomIdx]

  let rebuild = true
  switch (e.code) {
    // Move room
    case 'KeyI':  case 'ArrowUp':    r.z -= MOVE_STEP; break
    case 'KeyK':  case 'ArrowDown':  r.z += MOVE_STEP; break
    case 'KeyJ':  case 'ArrowLeft':  r.x -= MOVE_STEP; break
    case 'KeyL':  case 'ArrowRight': r.x += MOVE_STEP; break
    // Resize
    case 'BracketLeft':  r.w = Math.max(2, r.w - RESIZE_STEP); break
    case 'BracketRight': r.w += RESIZE_STEP; break
    case 'Minus':        r.d = Math.max(2, r.d - RESIZE_STEP); break
    case 'Equal':        r.d += RESIZE_STEP; break
    // Floor height
    case 'PageUp':   r.floorY += FLOORS.first; break
    case 'PageDown': r.floorY  = Math.max(0, r.floorY - FLOORS.first); break
    // Navigate rooms
    case 'Comma':  editorRoomIdx = (editorRoomIdx - 1 + rooms.length) % rooms.length; rebuild = false; break
    case 'Period': editorRoomIdx = (editorRoomIdx + 1) % rooms.length; rebuild = false; break
    // Rebuild live
    case 'KeyR': rebuildMap(); rebuild = false; break
    // Export to console
    case 'KeyX': exportLayout(); rebuild = false; break
    default: rebuild = false
  }

  if (rebuild) rebuildMap()
  updateEditorUI()
}

function rebuildMap() {
  // Remove all existing map meshes from scene
  const toRemove = []
  scene.traverse(obj => {
    if (obj.isMesh || (obj.isLight && obj !== flashlight)) toRemove.push(obj)
  })
  toRemove.forEach(obj => {
    scene.remove(obj)
    if (obj.geometry) obj.geometry.dispose()
  })

  // Clear state
  map.lights     = []
  map.floorZones = []
  map.doors      = []
  scene.remove(...scene.children.filter(c => c.isGroup))

  // Rebuild
  map.build()
  buildDoors()

  // Re-add ambient (it gets removed with the traverse)
  scene.add(new THREE.AmbientLight(0x18120a, 1.4))
}

function exportLayout() {
  const rooms = map.editableRooms
  if (!rooms) return
  const out = rooms.map(r =>
    `{ name:'${r.name}', x:${r.x}, z:${r.z}, w:${r.w}, d:${r.d}, floorY:${r.floorY}, h:${r.h||4.2} }`
  ).join(',\n  ')
  console.log(`// Exported layout:\nconst ROOMS = [\n  ${out}\n]`)
  console.log('👆 Copy this into AsylumMap.js ROOMS array')
}

// ─────────────────────────────────────────────
// Main loop
// ─────────────────────────────────────────────
const _dir   = new THREE.Vector3()
const _euler = new THREE.Euler(0, 0, 0, 'YXZ')
const clock  = new THREE.Timer()

function animate() {
  requestAnimationFrame(animate)
  clock.update()
  const delta = Math.max(0.001, Math.min(clock.getDelta(), 0.05))

  // ── Movement (only when not in editor) ──
  if (!editorOpen) {
    const speed = 5
    _dir.set(0, 0, 0)
    if (keys['KeyW']) _dir.z -= 1
    if (keys['KeyS']) _dir.z += 1
    if (keys['KeyA']) _dir.x -= 1
    if (keys['KeyD']) _dir.x += 1
    _dir.normalize().multiplyScalar(speed * delta)
    _euler.set(0, yaw, 0)
    _dir.applyEuler(_euler)
    camera.position.x += _dir.x
    camera.position.z += _dir.z

    // Floor grounding
    const floorY = map.getFloorY(camera.position)
    camera.position.y = floorY + 1.7
  }

  // ── Look ──
  camera.rotation.order = 'YXZ'
  camera.rotation.y = yaw
  camera.rotation.x = pitch

  // ── Animate doors ──
  for (const door of map.doors) {
    if (Math.abs(door.angle - door.targetAngle) > 0.001) {
      door.angle += (door.targetAngle - door.angle) * Math.min(1, DOOR_SPEED * delta)
      // Apply rotation around local Y axis of the pivot group
      door.group.rotation.y = door.group.userData.baseY + door.angle
    }
  }

  // ── Proximity door hint ──
  let nearDoor = false
  for (const door of map.doors) {
    if (camera.position.distanceTo(door.pos) < 3.0) { nearDoor = true; break }
  }
  document.getElementById('hud-hint').style.opacity = nearDoor ? '1' : '0'

  map.update(delta)
  renderer.render(scene, camera)
}

animate()
