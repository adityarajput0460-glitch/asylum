using UnityEngine;

namespace Asylum.Core
{
    /// <summary>
    /// Interface for all interactable objects in the game world.
    /// Implement this on doors, pickups, switches, staircases, etc.
    /// </summary>
    public interface IInteractable
    {
        /// <summary>
        /// Called when the player presses the interact key while looking at this object.
        /// </summary>
        void Interact(PlayerController player);

        /// <summary>
        /// Returns the UI prompt text to display, e.g. "[E] Open Door".
        /// </summary>
        string GetPromptText();

        /// <summary>
        /// Whether this object can currently be interacted with.
        /// Use this for locked doors, cooldowns, etc.
        /// </summary>
        bool CanInteract(PlayerController player);
    }
}
