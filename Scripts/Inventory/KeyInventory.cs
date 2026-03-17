using System;
using System.Collections.Generic;
using UnityEngine;

namespace Asylum.Core
{
    /// <summary>
    /// Key types available in the game. Add more as needed.
    /// </summary>
    public enum KeyType
    {
        ArchiveKey,
        MedicineKey,
        RooftopKey
    }

    /// <summary>
    /// Simple key inventory attached to the player.
    /// Tracks which keys the player has collected and syncs with GameManager flags.
    /// </summary>
    public class KeyInventory : MonoBehaviour
    {
        private readonly HashSet<KeyType> _keys = new HashSet<KeyType>();

        /// <summary>
        /// Fires whenever the inventory contents change. Passes the full set of keys.
        /// </summary>
        public event Action<HashSet<KeyType>> OnInventoryChanged;

        /// <summary>
        /// Add a key to the inventory.
        /// </summary>
        public void AddKey(KeyType key)
        {
            if (_keys.Add(key))
            {
                SyncToGameManager(key, true);
                OnInventoryChanged?.Invoke(_keys);
                Debug.Log($"[KeyInventory] Picked up: {key}");
            }
        }

        /// <summary>
        /// Check whether the player owns a specific key.
        /// </summary>
        public bool HasKey(KeyType key)
        {
            return _keys.Contains(key);
        }

        /// <summary>
        /// Remove a key (e.g. consumed on use). Optional.
        /// </summary>
        public void RemoveKey(KeyType key)
        {
            if (_keys.Remove(key))
            {
                SyncToGameManager(key, false);
                OnInventoryChanged?.Invoke(_keys);
            }
        }

        /// <summary>
        /// Get a read-only snapshot of the current keys.
        /// </summary>
        public IReadOnlyCollection<KeyType> GetKeys() => _keys;

        // ──────────────────────────── Sync ─────────────────────────────────
        private void SyncToGameManager(KeyType key, bool hasIt)
        {
            if (GameManager.Instance == null) return;

            switch (key)
            {
                case KeyType.ArchiveKey:   GameManager.Instance.hasArchiveKey   = hasIt; break;
                case KeyType.MedicineKey:  GameManager.Instance.hasMedicineKey  = hasIt; break;
                case KeyType.RooftopKey:   GameManager.Instance.hasRooftopKey   = hasIt; break;
            }
        }
    }
}
