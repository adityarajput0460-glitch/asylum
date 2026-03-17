using UnityEngine;

namespace Asylum.Core
{
    /// <summary>
    /// A key pickup in the world. Implements IInteractable.
    /// When the player presses E, the key is added to their inventory and this
    /// GameObject is destroyed.
    /// </summary>
    public class KeyPickup : MonoBehaviour, IInteractable
    {
        [Header("Key Settings")]
        [SerializeField] private KeyType keyType;
        [SerializeField] private string displayName = "Key";

        [Header("Pickup Effect (Optional)")]
        [SerializeField] private AudioClip pickupSound;
        [SerializeField] private GameObject pickupVFX;

        // ──────────────────────────── IInteractable ────────────────────────
        public string GetPromptText()
        {
            return $"[E] Pick up {displayName}";
        }

        public bool CanInteract(PlayerController player)
        {
            return true; // always pickable
        }

        public void Interact(PlayerController player)
        {
            KeyInventory inventory = player.GetComponent<KeyInventory>();
            if (inventory == null)
            {
                Debug.LogWarning("[KeyPickup] Player has no KeyInventory component!");
                return;
            }

            inventory.AddKey(keyType);

            // Optional audio
            if (pickupSound != null)
                AudioSource.PlayClipAtPoint(pickupSound, transform.position);

            // Optional VFX
            if (pickupVFX != null)
                Instantiate(pickupVFX, transform.position, Quaternion.identity);

            Destroy(gameObject);
        }
    }
}
