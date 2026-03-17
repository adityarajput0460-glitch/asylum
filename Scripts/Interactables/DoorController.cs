using System.Collections;
using UnityEngine;

namespace Asylum.Core
{
    /// <summary>
    /// Swinging door controller with hinge pivot animation, lock state,
    /// key requirement, and creaking audio.
    ///
    /// Setup:
    ///   DoorFrame (empty)
    ///     └─ DoorPivot (this script) — positioned at the hinge edge
    ///         └─ DoorMesh (the visual door)
    ///   Collider should be on DoorPivot or DoorMesh.
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public class DoorController : MonoBehaviour, IInteractable
    {
        // ──────────────────────────── Settings ─────────────────────────────
        [Header("Door ID (must be unique per door)")]
        [SerializeField] private string doorId = "door_01";

        [Header("Rotation")]
        [SerializeField] private float openAngle     = 90f;
        [SerializeField] private float closedAngle   = 0f;
        [SerializeField] private float swingDuration  = 1.0f;
        [SerializeField] private AnimationCurve swingCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);

        [Header("Lock")]
        [SerializeField] private bool isLocked;
        [SerializeField] private KeyType requiredKey;

        [Header("Audio")]
        [SerializeField] private AudioClip openSound;
        [SerializeField] private AudioClip closeSound;
        [SerializeField] private AudioClip lockedSound;

        [Header("Prompt Text")]
        [SerializeField] private string openPrompt   = "[E] Open Door";
        [SerializeField] private string closePrompt  = "[E] Close Door";
        [SerializeField] private string lockedPrompt = "[E] Locked";

        // ──────────────────────────── State ────────────────────────────────
        private bool _isOpen;
        private bool _isAnimating;
        private AudioSource _audioSource;

        // ──────────────────────────── Lifecycle ────────────────────────────
        private void Awake()
        {
            _audioSource = GetComponent<AudioSource>();
            _audioSource.playOnAwake = false;
            _audioSource.spatialBlend = 1f;
        }

        private void Start()
        {
            // Restore saved state
            if (GameManager.Instance != null && GameManager.Instance.IsDoorOpen(doorId))
            {
                _isOpen = true;
                transform.localRotation = Quaternion.Euler(0f, openAngle, 0f);
            }
        }

        // ──────────────────────────── IInteractable ────────────────────────
        public string GetPromptText()
        {
            if (isLocked)  return lockedPrompt;
            return _isOpen ? closePrompt : openPrompt;
        }

        public bool CanInteract(PlayerController player)
        {
            return !_isAnimating;
        }

        public void Interact(PlayerController player)
        {
            if (_isAnimating) return;

            // Locked check
            if (isLocked)
            {
                KeyInventory inv = player.GetComponent<KeyInventory>();
                if (inv != null && inv.HasKey(requiredKey))
                {
                    isLocked = false;
                    Debug.Log($"[Door] Unlocked {doorId} with {requiredKey}");
                }
                else
                {
                    PlayClip(lockedSound);
                    Debug.Log($"[Door] {doorId} is locked. Requires {requiredKey}");
                    return;
                }
            }

            // Toggle
            _isOpen = !_isOpen;

            // Save state
            if (GameManager.Instance != null)
                GameManager.Instance.SetDoorState(doorId, _isOpen);

            StartCoroutine(AnimateSwing());
        }

        // ──────────────────────────── Animation ────────────────────────────
        private IEnumerator AnimateSwing()
        {
            _isAnimating = true;

            float startAngle = _isOpen ? closedAngle : openAngle;
            float endAngle   = _isOpen ? openAngle   : closedAngle;

            PlayClip(_isOpen ? openSound : closeSound);

            float elapsed = 0f;
            while (elapsed < swingDuration)
            {
                elapsed += Time.deltaTime;
                float t = swingCurve.Evaluate(elapsed / swingDuration);
                float angle = Mathf.Lerp(startAngle, endAngle, t);
                transform.localRotation = Quaternion.Euler(0f, angle, 0f);
                yield return null;
            }

            transform.localRotation = Quaternion.Euler(0f, endAngle, 0f);
            _isAnimating = false;
        }

        // ──────────────────────────── Audio ────────────────────────────────
        private void PlayClip(AudioClip clip)
        {
            if (clip == null || _audioSource == null) return;
            _audioSource.clip = clip;
            _audioSource.Play();
        }
    }
}
