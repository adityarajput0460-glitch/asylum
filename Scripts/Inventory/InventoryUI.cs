using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace Asylum.Core
{
    /// <summary>
    /// UI panel that displays the player's collected keys.
    /// Listens to KeyInventory.OnInventoryChanged and rebuilds the icon list.
    /// 
    /// Setup:
    ///   Canvas → Panel (InventoryUI) → HorizontalLayoutGroup
    ///   Each key slot is instantiated from keySlotPrefab.
    /// </summary>
    public class InventoryUI : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private KeyInventory keyInventory;
        [SerializeField] private Transform slotContainer; // HorizontalLayoutGroup parent

        [Header("Slot Prefab")]
        [Tooltip("Prefab with an Image and optional TMP_Text child.")]
        [SerializeField] private GameObject keySlotPrefab;

        [Header("Key Icons")]
        [SerializeField] private Sprite archiveKeyIcon;
        [SerializeField] private Sprite medicineKeyIcon;
        [SerializeField] private Sprite rooftopKeyIcon;

        private void OnEnable()
        {
            if (keyInventory != null)
                keyInventory.OnInventoryChanged += Rebuild;
        }

        private void OnDisable()
        {
            if (keyInventory != null)
                keyInventory.OnInventoryChanged -= Rebuild;
        }

        private void Rebuild(HashSet<KeyType> keys)
        {
            // Clear existing slots
            foreach (Transform child in slotContainer)
                Destroy(child.gameObject);

            // Create a slot per key
            foreach (KeyType key in keys)
            {
                if (keySlotPrefab == null) continue;

                GameObject slot = Instantiate(keySlotPrefab, slotContainer);
                Image icon = slot.GetComponentInChildren<Image>();
                if (icon != null)
                    icon.sprite = GetIcon(key);

                TMP_Text label = slot.GetComponentInChildren<TMP_Text>();
                if (label != null)
                    label.text = key.ToString();
            }
        }

        private Sprite GetIcon(KeyType key)
        {
            return key switch
            {
                KeyType.ArchiveKey  => archiveKeyIcon,
                KeyType.MedicineKey => medicineKeyIcon,
                KeyType.RooftopKey  => rooftopKeyIcon,
                _                   => null,
            };
        }
    }
}
