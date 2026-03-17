import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════
// Ravenwood Asylum — AsylumMap.js
// Generated from Antigravity Map Export
// 5 floors: Ground, First, Second, Rooftop, Basement
// 91 rooms, 91 doors, 29 staircases
//
// Export coords: top-left origin, Y-down, 1px = 0.05 Unity units
// Three.js coords: centered, +X=East, +Z=South, +Y=Up
// ═══════════════════════════════════════════════════════════════

export const FLOORS = {
  basement: -4.5,
  ground:    0,
  first:     4.5,
  second:    9.0,
  roof:     13.5,
}

const ROOM_H  = 4.2
const CORR_H  = 3.8
const WALL_T  = 0.35
const DOOR_H  = 2.8

// ── Center offsets (center of largest bounding box) ──
const CX = 33    // approx center X of export
const CZ = 27    // approx center Y(Z) of export

function toWorld(ex, ey) {
  return { x: ex - CX, z: ey - CZ }
}

// ─── Geometry helpers ───────────────────────────────────
function box(scene, w, h, d, x, y, z, mat) {
  const geo  = new THREE.BoxGeometry(w, h, d)
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.set(x, y, z)
  mesh.receiveShadow = true
  mesh.castShadow    = true
  scene.add(mesh)
  return mesh
}

function makeRoom(scene, cx, cz, w, d, floorY, mat, h = ROOM_H) {
  const mid = floorY + h / 2
  box(scene, w, 0.15, d, cx, floorY, cz, mat.floor)
  box(scene, w, 0.10, d, cx, floorY + h, cz, mat.ceiling)
  box(scene, w, h, WALL_T, cx, mid, cz - d/2, mat.wall)
  box(scene, w, h, WALL_T, cx, mid, cz + d/2, mat.wall)
  box(scene, WALL_T, h, d, cx - w/2, mid, cz, mat.wall)
  box(scene, WALL_T, h, d, cx + w/2, mid, cz, mat.wall)
}

function makeStaircase(scene, x, z, floorY, targetY, facing, mat) {
  const steps = 14
  const sw = 3.0, sd = 0.45
  const sh = (targetY - floorY) / steps
  const dir = (facing === 'north' || facing === 'up') ? -1 : 1
  for (let i = 0; i < steps; i++) {
    const sy = floorY + sh/2 + i * sh
    const sz = z + dir * i * sd
    box(scene, sw, sh, sd, x, sy, sz, mat.stair)
  }
  const runD = steps * sd, runH = steps * sh, runZ = z + dir * (runD / 2)
  box(scene, 0.10, runH, runD, x - sw/2 - 0.08, floorY + runH/2, runZ, mat.balustrade)
  box(scene, 0.10, runH, runD, x + sw/2 + 0.08, floorY + runH/2, runZ, mat.balustrade)
}

function wainscot(scene, cx, cz, w, d, floorY, mat) {
  const ph = 1.2, mid = floorY + ph/2, off = WALL_T + 0.05
  box(scene, w, ph, 0.06, cx, mid, cz - d/2 + off, mat.wainscot)
  box(scene, w, ph, 0.06, cx, mid, cz + d/2 - off, mat.wainscot)
  box(scene, 0.06, ph, d, cx - w/2 + off, mid, cz, mat.wainscot)
  box(scene, 0.06, ph, d, cx + w/2 - off, mid, cz, mat.wainscot)
}

// ─── Room type → color tint for variety ─────────────────
const ROOM_TINTS = {
  outdoor:  0x0a0d08, chapel:   0x0e0a14, medical:  0x0c1218,
  secure:   0x100808, admin:    0x14100a, hall:     0x121010,
  ward:     0x0f0d0a, washroom: 0x0e1214, storage:  0x0d0b08,
  service:  0x100e08, entry:    0x141008, stair:    0x0e0c0a,
  objective:0x180a08, utility:  0x0c0e10, custom:   0x100e0c,
}

function getFloorMat(type) {
  const c = ROOM_TINTS[type] || 0x1a1816
  return new THREE.MeshLambertMaterial({ color: c })
}

// ═══════════════════════════════════════════════════════════
//  ROOM DATA — from Antigravity export
// ═══════════════════════════════════════════════════════════

const GF_ROOMS = [
  { id:'R1',  name:'Front Courtyard',     type:'outdoor', cx:32.5,  cy:13.25, w:60,   d:16.5 },
  { id:'R2',  name:'Main Entrance',       type:'entry',   cx:32.5,  cy:22,    w:10,   d:16   },
  { id:'R3',  name:'Reception / Desk',    type:'admin',   cx:32.75, cy:25.5,  w:3.5,  d:2    },
  { id:'R4',  name:'Central Hall',        type:'hall',    cx:32.5,  cy:17.5,  w:9,    d:6    },
  { id:'R5',  name:'Admin Office',        type:'admin',   cx:24.75, cy:17.75, w:5.5,  d:7.5  },
  { id:'R6',  name:'Staff Office',        type:'admin',   cx:40.25, cy:17.75, w:5.5,  d:7.5  },
  { id:'R7',  name:'Records Room',        type:'storage', cx:40.25, cy:20.25, w:4.5,  d:2.5  },
  { id:'R8',  name:'Records Archive',     type:'storage', cx:24.75, cy:20.25, w:4.5,  d:2.5  },
  { id:'R9',  name:'Chapel (GF)',         type:'chapel',  cx:15,    cy:26.5,  w:25,   d:10   },
  { id:'R10', name:'Central Corridor',    type:'hall',    cx:32.5,  cy:35.25, w:10,   d:10.5 },
  { id:'R15', name:'Examination Room',    type:'medical', cx:48.5,  cy:25.75, w:9,    d:8.5  },
  { id:'R16', name:'Security Room',       type:'secure',  cx:46.5,  cy:19.25, w:7,    d:4.5  },
  { id:'R17', name:'Staff Washroom (W)',   type:'washroom',cx:40.75, cy:28,    w:6.5,  d:4    },
  { id:'R18', name:'East Wing Corridor',  type:'custom',  cx:50,    cy:32,    w:25,   d:4    },
  { id:'R20', name:'Intake Room',         type:'medical', cx:57.75, cy:25.75, w:9.5,  d:8.5  },
  { id:'R21', name:'Isolation Room',      type:'secure',  cx:48.75, cy:37.25, w:8.5,  d:6.5  },
  { id:'R22', name:'Patient Washroom (E)',type:'washroom',cx:57.75, cy:37.25, w:9.5,  d:6.5  },
  { id:'R23', name:'West Wing Corridor',  type:'custom',  cx:15,    cy:33.5,  w:25,   d:4    },
  { id:'R24', name:'Autopsy Prep Room',   type:'medical', cx:20,    cy:38,    w:7,    d:5    },
  { id:'R25', name:'Laundry Room',        type:'service', cx:41,    cy:37.25, w:7,    d:6.5  },
  { id:'R26', name:'Morgue',              type:'medical', cx:13,    cy:38,    w:7,    d:5    },
  { id:'R27', name:'Morgue Cold Storage', type:'medical', cx:6,     cy:38,    w:7,    d:5    },
  { id:'R28', name:'Staff Kitchen',       type:'service', cx:40.75, cy:23.75, w:6.5,  d:4.5  },
  { id:'R29', name:'Basement Hatch (S)',  type:'stair',   cx:25.5,  cy:38,    w:4,    d:5    },
  { id:'R30', name:'Basement Hatch (N)',  type:'stair',   cx:20,    cy:19.5,  w:4,    d:4    },
]

const F1_ROOMS = [
  { id:'R1',  name:'Chapel (1F)',          type:'chapel',  cx:8.75,  cy:18.75, w:12.5, d:9.5  },
  { id:'R2',  name:'Chapel Vestry',        type:'chapel',  cx:21.25, cy:19.5,  w:12.5, d:11   },
  { id:'R4',  name:'Nurse Station',        type:'medical', cx:41.25, cy:24.75, w:6.5,  d:3.5  },
  { id:'R6',  name:'East Wing Corridor',   type:'custom',  cx:50.25, cy:29.25, w:24.5, d:5.5  },
  { id:'R7',  name:'Ward A — Dormitory',   type:'ward',    cx:47.5,  cy:22.5,  w:6,    d:8    },
  { id:'R8',  name:'Central Corridor 1F',  type:'hall',    cx:32.75, cy:27.25, w:10.5, d:26.5 },
  { id:'R9',  name:'Main Stair Landing',   type:'stair',   cx:32.75, cy:28,    w:7.5,  d:3    },
  { id:'R10', name:'Ward A — Quiet Room',  type:'secure',  cx:42,    cy:20.75, w:5,    d:4.5  },
  { id:'R11', name:'Ward A — Day Room',    type:'ward',    cx:53.75, cy:22.5,  w:6.5,  d:8    },
  { id:'R12', name:'Ward A — Washroom',    type:'washroom',cx:59.75, cy:22.5,  w:5.5,  d:8    },
  { id:'R13', name:'Ward B — Dormitory',   type:'ward',    cx:16.5,  cy:32.25, w:6,    d:7.5  },
  { id:'R14', name:'Ward B — Quiet Room',  type:'secure',  cx:22.5,  cy:34,    w:6,    d:4    },
  { id:'R15', name:'West Airing Court',    type:'outdoor', cx:15,    cy:38.25, w:25,   d:4.5  },
  { id:'R16', name:'East Airing Court',    type:'outdoor', cx:50.25, cy:16.25, w:24.5, d:4.5  },
  { id:'R17', name:'West Wing Corridor',   type:'custom',  cx:8.75,  cy:26,    w:12.5, d:5    },
  { id:'R18', name:'Ward B — Day Room',    type:'ward',    cx:10.75, cy:32.25, w:5.5,  d:7.5  },
  { id:'R19', name:'Ward B — Washroom',    type:'washroom',cx:5.25,  cy:32.25, w:5.5,  d:7.5  },
  { id:'R20', name:'Staff Washroom 1F',    type:'washroom',cx:50.5,  cy:36.25, w:7,    d:8.5  },
  { id:'R21', name:'Medication Room',      type:'medical', cx:23.5,  cy:30.25, w:8,    d:3.5  },
  { id:'R22', name:'Consulting Room 1',    type:'medical', cx:42.5,  cy:36.25, w:9,    d:8.5  },
  { id:'R23', name:'Consulting Room 2',    type:'medical', cx:58.25, cy:36.25, w:8.5,  d:8.5  },
  { id:'R57', name:'Chapel Corridor',      type:'custom',  cx:21.25, cy:26.75, w:12.5, d:3.5  },
]

const F2_ROOMS = [
  { id:'R2',  name:"Director's Office",    type:'objective',cx:24.25,cy:19.5,  w:6.5,  d:11   },
  { id:'R3',  name:'Chapel Gallery',       type:'chapel',  cx:8.75,  cy:18.75, w:12.5, d:9.5  },
  { id:'R5',  name:'Central Corridor 2F',  type:'hall',    cx:32.75, cy:27.25, w:10.5, d:26.5 },
  { id:'R6',  name:'Main Stair Landing 2F',type:'stair',   cx:32.75, cy:19.5,  w:7.5,  d:3    },
  { id:'R11', name:'Nurse Station 2F',     type:'medical', cx:41.25, cy:20.75, w:6.5,  d:4.5  },
  { id:'R12', name:"Director's Bedroom",   type:'admin',   cx:18,    cy:19.5,  w:6,    d:11   },
  { id:'R13', name:"Director's Washroom",  type:'washroom',cx:18,    cy:16,    w:6,    d:4    },
  { id:'R15', name:'West Gallery Corridor',type:'custom',  cx:8.75,  cy:26,    w:12.5, d:5    },
  { id:'R18', name:'Chapel Corridor 2F',   type:'custom',  cx:21.25, cy:26.75, w:12.5, d:3.5  },
  { id:'R19', name:'Bell Rope Room',       type:'chapel',  cx:23.5,  cy:32.25, w:8,    d:7.5  },
  { id:'R20', name:'Staff Office 2F',      type:'admin',   cx:16,    cy:32.25, w:7,    d:7.5  },
  { id:'R21', name:'Staff Common Room',    type:'admin',   cx:5.5,   cy:32.25, w:6,    d:7.5  },
  { id:'R22', name:'Staff Washroom 2F',    type:'washroom',cx:10.5,  cy:32.25, w:4,    d:7.5  },
  { id:'R23', name:'East Wing Corridor 2F',type:'custom',  cx:50.25, cy:29.25, w:24.5, d:5.5  },
  { id:'R24', name:'Hydrotherapy Room',    type:'medical', cx:56.25, cy:36.25, w:12.5, d:8.5  },
  { id:'R25', name:'ECT Room',             type:'medical', cx:44,    cy:36.25, w:12,   d:8.5  },
  { id:'R26', name:'Records Storage',      type:'storage', cx:41.25, cy:24.75, w:6.5,  d:3.5  },
  { id:'R27', name:'Observation Room',     type:'medical', cx:57.25, cy:22.5,  w:10.5, d:8    },
  { id:'R28', name:'Patient Prep Room',    type:'medical', cx:48.25, cy:22.5,  w:7.5,  d:8    },
]

const ROOF_ROOMS = [
  { id:'R1',  name:'North Parapet',        type:'outdoor', cx:20.25, cy:20.75, w:35.5, d:13.5 },
  { id:'R2',  name:'South Parapet',        type:'outdoor', cx:45,    cy:34,    w:35,   d:13   },
  { id:'R3',  name:'East Parapet',         type:'outdoor', cx:47.75, cy:24.5,  w:29.5, d:12   },
  { id:'R4',  name:'West Parapet',         type:'outdoor', cx:17.75, cy:30.25, w:30.5, d:11.5 },
  { id:'R5',  name:'E Rooftop Stairwell',  type:'stair',   cx:60.75, cy:29.25, w:3.5,  d:5.5  },
  { id:'R6',  name:'W Rooftop Stairwell',  type:'stair',   cx:4.25,  cy:26,    w:3.5,  d:5    },
  { id:'R7',  name:'Escape Terrace',       type:'objective',cx:45,   cy:36.25, w:35,   d:8.5  },
  { id:'R8',  name:'Maintenance Shed',     type:'service', cx:45,    cy:22.5,  w:35,   d:8    },
  { id:'R9',  name:'Bell Tower',           type:'chapel',  cx:12.5,  cy:19,    w:6,    d:4    },
  { id:'R11', name:'Bell Tower Approach',  type:'custom',  cx:20.75, cy:17.5,  w:11.5, d:7    },
  { id:'R12', name:'Water Tower Platform', type:'utility', cx:18.5,  cy:16,    w:6,    d:4    },
]

const BSMT_ROOMS = [
  { id:'R1',  name:'Main Basement',        type:'custom',  cx:32.5,  cy:30.5,  w:60,   d:20   },
  { id:'R6',  name:'Flooded Corridor',     type:'hall',    cx:15,    cy:30.5,  w:25,   d:18   },
  { id:'R7',  name:'Overflow Morgue',      type:'medical', cx:7,     cy:33,    w:9,    d:13   },
  { id:'R8',  name:'Underground Washroom', type:'washroom',cx:6.25,  cy:24,    w:7.5,  d:5    },
  { id:'R9',  name:'Maintenance Tunnel',   type:'hall',    cx:45,    cy:26.75, w:35,   d:2.5  },
  { id:'R4',  name:'Secret Passage Exit',  type:'entry',   cx:59.5,  cy:23.5,  w:6,    d:4    },
  { id:'R12', name:'Fuse Room',            type:'utility', cx:25,    cy:23.5,  w:5,    d:4    },
  { id:'R15', name:'Flooded Corridor S',   type:'hall',    cx:45,    cy:34.25, w:35,   d:12.5 },
  { id:'R16', name:'Solitary Cells',       type:'secure',  cx:38,    cy:37.25, w:21,   d:6.5  },
  { id:'R17', name:'Boiler Maintenance',   type:'utility', cx:55.5,  cy:37.25, w:14,   d:6.5  },
  { id:'R18', name:'Boiler Room',          type:'utility', cx:59.5,  cy:37.25, w:6,    d:6.5  },
  { id:'R25', name:'Coal Storage',         type:'storage', cx:52.5,  cy:38.75, w:8,    d:3.5  },
]

// ─── Door data ──────────────────────────────────────────
// We store: export center (cx,cy), size for orientation
const GF_DOORS = [
  { cx:32.5,  cy:5.25,  w:18,  h:3.5, rot:0,   type:'gate'    },
  { cx:2,     cy:33.5,  w:4,   h:3,   rot:90,  type:'gate'    },
  { cx:64,    cy:32,    w:4,   h:3,   rot:90,  type:'gate'    },
  { cx:32.5,  cy:42.25, w:7,   h:3.5, rot:0,   type:'door'    },
  { cx:26,    cy:26.75, w:6,   h:3.5, rot:270, type:'double'  },
  { cx:32.5,  cy:11.25, w:8,   h:5.5, rot:0,   type:'arch'    },
  { cx:46.25, cy:15.75, w:2.5, h:2.5, rot:0,   type:'ward'    },
  { cx:32.5,  cy:32.5,  w:4,   h:5,   rot:180, type:'arch'    },
  { cx:38.75, cy:27.25, w:2.5, h:2.5, rot:270, type:'ward'    },
  { cx:38.75, cy:22.75, w:2.5, h:2.5, rot:90,  type:'ward'    },
  { cx:48.5,  cy:27.5,  w:4,   h:5,   rot:0,   type:'arch'    },
  { cx:58,    cy:27.5,  w:4,   h:5,   rot:0,   type:'arch'    },
  { cx:13,    cy:37.5,  w:3,   h:4,   rot:180, type:'arch'    },
  { cx:20,    cy:37.5,  w:3,   h:4,   rot:180, type:'arch'    },
  { cx:26.25, cy:16.25, w:2.5, h:2.5, rot:270, type:'ward'    },
  { cx:38.75, cy:16.25, w:2.5, h:2.5, rot:270, type:'ward'    },
  { cx:26.25, cy:19.75, w:1.5, h:1.5, rot:0,   type:'ward'    },
  { cx:38.75, cy:19.75, w:1.5, h:1.5, rot:0,   type:'ward'    },
  { cx:25,    cy:33.5,  w:4,   h:5,   rot:270, type:'arch'    },
  { cx:40,    cy:32,    w:4,   h:5,   rot:90,  type:'arch'    },
  { cx:6,     cy:37.5,  w:3,   h:4,   rot:180, type:'arch'    },
  { cx:58,    cy:36.5,  w:4,   h:5,   rot:180, type:'arch'    },
  { cx:49.5,  cy:36.5,  w:4,   h:5,   rot:180, type:'arch'    },
  { cx:41,    cy:36.5,  w:4,   h:5,   rot:180, type:'arch'    },
]

// ═══════════════════════════════════════════════════════════
//  STAIRCASE DATA
// ═══════════════════════════════════════════════════════════
const GF_STAIRS = [
  { cx:25.5, cy:37.75, targetFloor:'first'  },
  { cx:32.75,cy:28,    targetFloor:'first'  },
  { cx:20,   cy:19,    targetFloor:'first'  },
  { cx:36.5, cy:25.5,  targetFloor:'first'  },
  { cx:29,   cy:25.5,  targetFloor:'first'  },
]

const F1_STAIRS = [
  { cx:32.75,cy:23.75, targetFloor:'second' },
  { cx:25.25,cy:23.25, targetFloor:'second' },
  { cx:32.75,cy:36,    targetFloor:'second' },
  { cx:8.75, cy:24.75, targetFloor:'second' },
  { cx:60.75,cy:29.25, targetFloor:'second' },
  { cx:56.25,cy:30.75, targetFloor:'second' },
]

const F2_STAIRS = [
  { cx:32.75,cy:36,    targetFloor:'roof' },
  { cx:8.75, cy:24.75, targetFloor:'roof' },
  { cx:60.75,cy:29.25, targetFloor:'roof' },
  { cx:56.25,cy:30.75, targetFloor:'roof' },
  { cx:32.75,cy:26,    targetFloor:'roof' },
  { cx:36.25,cy:22.75, targetFloor:'roof' },
  { cx:28.75,cy:22.75, targetFloor:'roof' },
]

// ═══════════════════════════════════════════════════════════
//  AsylumMap class
// ═══════════════════════════════════════════════════════════
export class AsylumMap {
  constructor(scene) {
    this.scene         = scene
    this.lights        = []
    this.floorZones    = []
    this.doors         = []
    this.doorSpecs     = []
    this.editableRooms = []
  }

  addEditableRoom(name, x, z, w, d, floorY, h = ROOM_H) {
    this.editableRooms.push({ name, x, z, w, d, floorY, h })
  }

  addDoor(x, z, floorY, facing, width = 1.8) {
    this.doorSpecs.push({ x, z, floorY, facing, width })
  }

  addFloorZone(x, z, w, d, floorY) {
    this.floorZones.push({
      minX: x - w/2, maxX: x + w/2,
      minZ: z - d/2, maxZ: z + d/2,
      y: floorY
    })
  }

  getFloorY(pos) {
    let best = FLOORS.ground
    for (const zone of this.floorZones) {
      if (pos.x >= zone.minX && pos.x <= zone.maxX &&
          pos.z >= zone.minZ && pos.z <= zone.maxZ &&
          zone.y < pos.y && zone.y > best) {
        best = zone.y
      }
    }
    return best
  }

  addLight(x, y, z, color = 0xff8833, intensity = 4, dist = 20, shadow = false) {
    const light = new THREE.PointLight(color, intensity, dist)
    light.position.set(x, y, z)
    // Shadow casting is DISABLED for all room lights to avoid exceeding
    // MAX_TEXTURE_IMAGE_UNITS — each shadow PointLight uses 6 texture units
    light.castShadow = false
    this.scene.add(light)
    this.lights.push({ light, base: intensity, timer: Math.random() * 2 })
    return light
  }

  // ─── Build all floors ─────────────────────────────────
  build() {
    const s = this.scene

    const MAT = {
      wall:       new THREE.MeshLambertMaterial({ color: 0x2b1c11 }),
      floor:      new THREE.MeshLambertMaterial({ color: 0x1a1816 }),
      ceiling:    new THREE.MeshLambertMaterial({ color: 0x1d1b15 }),
      stair:      new THREE.MeshLambertMaterial({ color: 0x281809 }),
      balustrade: new THREE.MeshLambertMaterial({ color: 0x0f0f0f }),
      wainscot:   new THREE.MeshLambertMaterial({ color: 0x1c1107 }),
      sill:       new THREE.MeshLambertMaterial({ color: 0x28261e }),
      exterior:   new THREE.MeshLambertMaterial({ color: 0x080605 }),
      door:       new THREE.MeshLambertMaterial({ color: 0x181007 }),
      metal:      new THREE.MeshLambertMaterial({ color: 0x101316 }),
      wood:       new THREE.MeshLambertMaterial({ color: 0x221608 }),
      tile:       new THREE.MeshLambertMaterial({ color: 0x1e1e20 }),
    }
    this.MAT = MAT

    s.add(new THREE.AmbientLight(0x2a1e12, 3.5))

    // ── Build each floor ──
    this._buildFloor(s, GF_ROOMS,   GF_DOORS,  GF_STAIRS,  FLOORS.ground,   MAT)
    this._buildFloor(s, F1_ROOMS,   [],        F1_STAIRS,  FLOORS.first,    MAT)
    this._buildFloor(s, F2_ROOMS,   [],        F2_STAIRS,  FLOORS.second,   MAT)
    this._buildFloor(s, ROOF_ROOMS, [],        [],         FLOORS.roof,     MAT)
    this._buildFloor(s, BSMT_ROOMS, [],        [],         FLOORS.basement, MAT)

    // ── Furnishings for key rooms ──
    this._buildFurnishings(s, MAT)
  }

  _buildFloor(s, rooms, doors, stairs, floorY, MAT) {
    // Build all rooms
    for (const r of rooms) {
      const p = toWorld(r.cx, r.cy)
      const h = r.type === 'outdoor' ? 0.5 : // outdoor = low walls / parapets
                r.type === 'chapel'  ? 5.5 :
                r.type === 'hall'    ? CORR_H : ROOM_H

      if (r.type === 'outdoor') {
        // Outdoor: just floor slab + low parapet walls
        box(s, r.w, 0.15, r.d, p.x, floorY, p.z, MAT.floor)
        const pH = 1.2, mid = floorY + pH/2
        box(s, r.w, pH, 0.2, p.x, mid, p.z - r.d/2, MAT.exterior)
        box(s, r.w, pH, 0.2, p.x, mid, p.z + r.d/2, MAT.exterior)
        box(s, 0.2, pH, r.d, p.x - r.w/2, mid, p.z, MAT.exterior)
        box(s, 0.2, pH, r.d, p.x + r.w/2, mid, p.z, MAT.exterior)
      } else {
        makeRoom(s, p.x, p.z, r.w, r.d, floorY, MAT, h)
      }

      this.addFloorZone(p.x, p.z, r.w, r.d, floorY)
      this.addEditableRoom(r.name, p.x, p.z, r.w, r.d, floorY, h)

      // Per-room lighting
      const ly = floorY + (h > 1 ? h - 0.6 : 0.8)
      const tint = ROOM_TINTS[r.type] || 0xff8833
      // Brighter base intensity for large rooms
      const area = r.w * r.d
      const intensity = area > 100 ? 18 : area > 40 ? 12 : 8
      const dist = Math.max(r.w, r.d) * 1.8
      this.addLight(p.x, ly, p.z, 0xffaa44, intensity, dist, false)
      // Add secondary fill lights for large rooms
      if (area > 60) {
        this.addLight(p.x - r.w/4, ly, p.z - r.d/4, 0xcc7711, intensity * 0.4, dist * 0.6, false)
        this.addLight(p.x + r.w/4, ly, p.z + r.d/4, 0xcc7711, intensity * 0.4, dist * 0.6, false)
      }

      // Wainscoting for admin, chapel, objective rooms
      if (['admin','chapel','objective','entry'].includes(r.type)) {
        wainscot(s, p.x, p.z, r.w, r.d, floorY, MAT)
      }
    }

    // Build doors as wall openings (visual doorframes)
    for (const d of doors) {
      const p = toWorld(d.cx, d.cy)
      const isNS = d.rot === 0 || d.rot === 180
      const facing = isNS ? 'n' : 'e'
      const dw = Math.min(d.w, d.h, 2.5)
      this.addDoor(p.x, p.z, floorY, facing, dw)
    }

    // Build staircases
    for (const st of stairs) {
      const p = toWorld(st.cx, st.cy)
      const targetY = FLOORS[st.targetFloor] || floorY + 4.5
      makeStaircase(s, p.x, p.z, floorY, targetY, 'north', MAT)
    }
  }

  // ── Key room furnishings ──────────────────────────────
  _buildFurnishings(s, M) {
    const gy = FLOORS.ground

    // Main Entrance — reception desk
    const ent = toWorld(32.5, 22)
    box(s, 4, 1.0, 0.5, ent.x - 1, gy + 0.5, ent.z + 3, M.wainscot)
    box(s, 4, 0.06, 0.7, ent.x - 1, gy + 1.0, ent.z + 3, M.sill)
    // Front doors — chained shut
    box(s, 2.2, 3.0, 0.14, ent.x - 1.5, gy + 1.5, ent.z + 8, M.door)
    box(s, 2.2, 3.0, 0.14, ent.x + 1.5, gy + 1.5, ent.z + 8, M.door)
    box(s, 5.0, 0.07, 0.07, ent.x, gy + 1.2, ent.z + 8.1, M.metal) // chain

    // Chapel (GF) — pews
    const chp = toWorld(15, 26.5)
    for (let row = 0; row < 5; row++)
      box(s, 18, 0.9, 0.45, chp.x, gy + 0.45, chp.z - 3 + row * 1.8, M.wood)
    box(s, 12, 0.25, 3, chp.x, gy + 0.25, chp.z + 4, M.stair) // altar platform
    box(s, 0.5, 1.2, 0.5, chp.x, gy + 1.2, chp.z + 3, M.wainscot) // lectern

    // Morgue — autopsy slabs
    const mrg = toWorld(13, 38)
    for (let i = -1; i <= 1; i++)
      box(s, 1.8, 0.85, 0.8, mrg.x + i*2.5, gy + 0.85, mrg.z, M.sill)

    // Morgue Cold Storage — drawers wall
    const mcs = toWorld(6, 38)
    box(s, 0.14, 3.5, 4, mcs.x - 3.3, gy + 1.75, mcs.z, M.metal)

    // Security Room — monitors
    const sec = toWorld(46.5, 19.25)
    box(s, 5, 0.8, 0.5, sec.x, gy + 0.8, sec.z - 1.5, M.wood) // desk
    for (let i = -2; i <= 2; i++)
      box(s, 0.6, 0.5, 0.3, sec.x + i, gy + 1.35, sec.z - 1.5, M.metal) // monitors

    // ── First Floor furnishings ──
    const fy = FLOORS.first

    // Ward A Dormitory — beds
    const wa = toWorld(47.5, 22.5)
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
      const bx = wa.x - 1.5 + c * 3
      const bz = wa.z - 2 + r * 4
      box(s, 0.9, 0.55, 2.0, bx, fy + 0.55, bz, M.metal)
      box(s, 0.85, 0.12, 1.9, bx, fy + 0.85, bz, M.exterior) // mattress
    }

    // Ward B Dormitory — beds
    const wb = toWorld(16.5, 32.25)
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
      const bx = wb.x - 1.5 + c * 3
      const bz = wb.z - 2 + r * 4
      box(s, 0.9, 0.55, 2.0, bx, fy + 0.55, bz, M.metal)
      box(s, 0.85, 0.12, 1.9, bx, fy + 0.85, bz, M.exterior)
    }

    // Nurse Station — desk
    const ns = toWorld(41.25, 24.75)
    box(s, 5, 1.0, 0.5, ns.x, fy + 0.5, ns.z, M.wainscot)

    // ── Second Floor furnishings ──
    const sy = FLOORS.second

    // Director's Office — desk, bookshelves, fireplace
    const dir = toWorld(24.25, 19.5)
    box(s, 3.0, 0.85, 1.8, dir.x, sy + 0.85, dir.z, M.wainscot) // desk
    box(s, 3.2, 0.06, 2.0, dir.x, sy + 1.65, dir.z, M.sill) // desk top
    box(s, 0.25, 3.5, 10, dir.x - 3, sy + 1.75, dir.z, M.wood) // bookshelf W
    box(s, 0.25, 3.5, 10, dir.x + 3, sy + 1.75, dir.z, M.wood) // bookshelf E
    box(s, 2.5, 2.2, 0.5, dir.x, sy + 1.1, dir.z - 5, M.exterior) // fireplace

    // ECT Room — treatment chair
    const ect = toWorld(44, 36.25)
    box(s, 1.0, 0.9, 2.0, ect.x, sy + 0.45, ect.z, M.tile)
    box(s, 1.1, 0.06, 0.1, ect.x, sy + 0.75, ect.z - 0.5, M.metal) // strap
    box(s, 1.1, 0.06, 0.1, ect.x, sy + 0.75, ect.z + 0.5, M.metal)

    // Hydrotherapy Room — tubs
    const hyd = toWorld(56.25, 36.25)
    for (let i = -1; i <= 1; i++)
      box(s, 1.5, 0.7, 2.5, hyd.x + i*4, sy + 0.35, hyd.z, M.tile)

    // ── Basement furnishings ──
    const by = FLOORS.basement

    // Fuse Room — fuse box
    const fuse = toWorld(25, 23.5)
    box(s, 0.7, 1.0, 0.12, fuse.x, by + 1.2, fuse.z - 1.8, M.metal)

    // Boiler Room
    const boil = toWorld(59.5, 37.25)
    box(s, 2.5, 3.5, 2.5, boil.x, by + 1.75, boil.z, M.metal)
    box(s, 0.8, 4.2, 0.8, boil.x, by + 2.1, boil.z, M.balustrade) // flue

    // Solitary Cells — iron bars
    const sol = toWorld(38, 37.25)
    for (let i = -8; i <= 8; i += 3)
      box(s, 0.06, 2.8, 0.06, sol.x + i, by + 1.4, sol.z - 2.5, M.balustrade)

    // ── Rooftop furnishings ──
    const ry = FLOORS.roof

    // Bell Tower — bell
    const bell = toWorld(12.5, 19)
    box(s, 2.5, 1.8, 2.5, bell.x, ry + 4.0, bell.z, M.metal)
    box(s, 2.0, 1.2, 2.0, bell.x, ry + 3.5, bell.z, M.balustrade)

    // Water Tower
    const wt = toWorld(18.5, 16)
    box(s, 4, 4, 4, wt.x, ry + 4, wt.z, M.metal) // tank
    for (const [lx,lz] of [[-1.5,-1.5],[-1.5,1.5],[1.5,-1.5],[1.5,1.5]])
      box(s, 0.25, 3.5, 0.25, wt.x+lx, ry+1.75, wt.z+lz, M.balustrade) // legs

    // Escape Terrace — signal flares
    const esc = toWorld(45, 36.25)
    for (const [fx, fz] of [[0,0],[3,1],[-3,-1]])
      box(s, 0.12, 0.5, 0.12, esc.x+fx, ry+0.25, esc.z+fz, M.metal)
  }

  // Gas-lamp flicker
  update(delta) {
    for (const e of this.lights) {
      e.timer -= delta
      if (e.timer <= 0) {
        e.light.intensity = e.base * (0.5 + Math.random() * 0.8)
        e.timer = 0.08 + Math.random() * 0.45
      }
    }
  }
}
