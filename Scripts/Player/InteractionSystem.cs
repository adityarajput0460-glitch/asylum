using UnityEngine;
using Asylum.UI;

namespace Asylum.Core
{
    /// <summary>
    /// Raycasts from the camera center to detect IInteractable objects.
    /// Shows a prompt UI and fires interaction on E key press.
    /// </summary>
    public class InteractionSystem : MonoBehaviour
    {
        [Header("Raycast")]
        [SerializeField] private float interactRange = 3f;
        [SerializeField] private LayerMask interactMask = ~0; // everything by default
        [SerializeField] private Transform cameraTransform;

        [Header("UI")]
        [SerializeField] private InteractionPromptUI promptUI;

        [Header("Debug")]
        [SerializeField] private bool showDebugRay = true;

        private IInteractable _currentTarget;
        private PlayerController _player;

        private void Awake()
        {
            _player = GetComponent<PlayerController>();
        }

        private void Update()
        {
            PerformRaycast();
            HandleInteractInput();
        }

        private void PerformRaycast()
        {
            if (cameraTransform == null) return;

            Ray ray = new Ray(cameraTransform.position, cameraTransform.forward);

            if (showDebugRay)
                Debug.DrawRay(ray.origin, ray.direction * interactRange, Color.cyan);

            if (Physics.Raycast(ray, out RaycastHit hit, interactRange, interactMask))
            {
                // Try the hit object itself, then its parent (e.g. door child mesh)
                IInteractable interactable = hit.collider.GetComponent<IInteractable>();
                if (interactable == null)
                    interactable = hit.collider.GetComponentInParent<IInteractable>();

                if (interactable != null && interactable.CanInteract(_player))
                {
                    _currentTarget = interactable;
                    if (promptUI != null)
                        promptUI.Show(interactable.GetPromptText());
                    return;
                }
            }

            // Nothing valid in sight
            ClearTarget();
        }

        private void HandleInteractInput()
        {
            if (_currentTarget == null) return;

            if (Input.GetKeyDown(KeyCode.E))
            {
                _currentTarget.Interact(_player);
            }
        }

        private void ClearTarget()
        {
            if (_currentTarget != null)
            {
                _currentTarget = null;
                if (promptUI != null)
                    promptUI.Hide();
            }
        }
    }
}
