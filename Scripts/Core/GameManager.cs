using System;
using System.Collections.Generic;
using UnityEngine;

namespace Asylum.Core
{
    /// <summary>
    /// Singleton Game Manager — tracks progression flags, floor state, and door states.
    /// Attach to a persistent GameObject in the scene (or use DontDestroyOnLoad).
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        // ──────────────────────────── Singleton ────────────────────────────
        public static GameManager Instance { get; private set; }

        // ──────────────────────────── Progression Flags ────────────────────
        [Header("Progression Keys")]
        public bool hasArchiveKey;
        public bool hasMedicineKey;
        public bool hasRooftopKey;

        [Header("World State")]
        public bool powerOn;

        // ──────────────────────────── Floor Tracking ───────────────────────
        [Header("Floor")]
        [SerializeField] private int _currentFloor;
        public int CurrentFloor
        {
            get => _currentFloor;
            set
            {
                if (_currentFloor != value)
                {
                    int previous = _currentFloor;
                    _currentFloor = value;
                    OnFloorChanged?.Invoke(previous, _currentFloor);
                }
            }
        }

        /// <summary>
        /// Fires when the player changes floors. Args: (previousFloor, newFloor).
        /// </summary>
        public event Action<int, int> OnFloorChanged;

        // ──────────────────────────── Door States ──────────────────────────
        // Key = unique door ID, Value = true if open
        private readonly Dictionary<string, bool> _doorStates = new Dictionary<string, bool>();

        /// <summary>
        /// Fires whenever any door state changes. Args: (doorId, isOpen).
        /// </summary>
        public event Action<string, bool> OnDoorStateChanged;

        // ──────────────────────────── Lifecycle ────────────────────────────
        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        // ──────────────────────────── Door API ─────────────────────────────
        /// <summary>
        /// Register or update a door's open/closed state.
        /// </summary>
        public void SetDoorState(string doorId, bool isOpen)
        {
            _doorStates[doorId] = isOpen;
            OnDoorStateChanged?.Invoke(doorId, isOpen);
        }

        /// <summary>
        /// Query whether a specific door is currently open.
        /// Returns false if the door has never been registered.
        /// </summary>
        public bool IsDoorOpen(string doorId)
        {
            return _doorStates.TryGetValue(doorId, out bool open) && open;
        }

        // ──────────────────────────── Progression Helpers ──────────────────
        /// <summary>
        /// Convenience method — set any progression flag by name at runtime.
        /// </summary>
        public void SetFlag(string flagName, bool value)
        {
            switch (flagName)
            {
                case nameof(hasArchiveKey):   hasArchiveKey   = value; break;
                case nameof(hasMedicineKey):  hasMedicineKey  = value; break;
                case nameof(hasRooftopKey):   hasRooftopKey   = value; break;
                case nameof(powerOn):         powerOn         = value; break;
                default:
                    Debug.LogWarning($"[GameManager] Unknown flag: {flagName}");
                    break;
            }
        }

        /// <summary>
        /// Query any progression flag by name.
        /// </summary>
        public bool GetFlag(string flagName)
        {
            return flagName switch
            {
                nameof(hasArchiveKey)   => hasArchiveKey,
                nameof(hasMedicineKey)  => hasMedicineKey,
                nameof(hasRooftopKey)   => hasRooftopKey,
                nameof(powerOn)         => powerOn,
                _                       => false,
            };
        }

        // ──────────────────────────── Reset ────────────────────────────────
        /// <summary>
        /// Resets all game state — useful for new-game or debug.
        /// </summary>
        public void ResetAll()
        {
            hasArchiveKey  = false;
            hasMedicineKey = false;
            hasRooftopKey  = false;
            powerOn        = false;
            _currentFloor  = 0;
            _doorStates.Clear();
        }
    }
}
