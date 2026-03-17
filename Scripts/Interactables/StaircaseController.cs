using System.Collections;
using UnityEngine;

namespace Asylum.Core
{
    /// <summary>
    /// Staircase transition controller.
    /// Place a trigger collider at the staircase. When the player enters the trigger
    /// and presses E, they are smoothly moved between floor waypoints.
    ///
    /// Setup:
    ///   Staircase (this script + BoxCollider isTrigger)
    ///     • bottomWaypoint — Transform at the bottom landing
    ///     • topWaypoint    — Transform at the top landing
    /// </summary>
    public class StaircaseController : MonoBehaviour, IInteractable
    {
        [Header("Waypoints")]
        [SerializeField] private Transform bottomWaypoint;
        [SerializeField] private Transform topWaypoint;

        [Header("Floor Mapping")]
        [SerializeField] private int bottomFloor = 0;
        [SerializeField] private int topFloor    = 1;

        [Header("Transition")]
        [SerializeField] private float transitionDuration = 1.5f;
        [SerializeField] private AnimationCurve moveCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);

        [Header("Audio (Optional)")]
        [SerializeField] private AudioClip transitionSound;

        [Header("Prompt")]
        [SerializeField] private string goUpPrompt   = "[E] Go Upstairs";
        [SerializeField] private string goDownPrompt = "[E] Go Downstairs";

        // ──────────────────────────── State ────────────────────────────────
        private bool _isTransitioning;
        private bool _playerInTrigger;
        private PlayerController _playerRef;

        // ──────────────────────────── Trigger ──────────────────────────────
        private void OnTriggerEnter(Collider other)
        {
            if (other.TryGetComponent(out PlayerController pc))
            {
                _playerInTrigger = true;
                _playerRef = pc;
            }
        }

        private void OnTriggerExit(Collider other)
        {
            if (other.TryGetComponent<PlayerController>(out _))
            {
                _playerInTrigger = false;
                _playerRef = null;
            }
        }

        // ──────────────────────────── IInteractable ────────────────────────
        public string GetPromptText()
        {
            if (GameManager.Instance == null)
                return goUpPrompt;

            bool atBottom = GameManager.Instance.CurrentFloor <= bottomFloor;
            return atBottom ? goUpPrompt : goDownPrompt;
        }

        public bool CanInteract(PlayerController player)
        {
            return _playerInTrigger && !_isTransitioning;
        }

        public void Interact(PlayerController player)
        {
            if (_isTransitioning || !_playerInTrigger) return;

            bool goingUp = true;
            if (GameManager.Instance != null)
                goingUp = GameManager.Instance.CurrentFloor <= bottomFloor;

            Transform target = goingUp ? topWaypoint : bottomWaypoint;
            int targetFloor  = goingUp ? topFloor    : bottomFloor;

            StartCoroutine(TransitionPlayer(player, target, targetFloor));
        }

        // ──────────────────────────── Transition ───────────────────────────
        private IEnumerator TransitionPlayer(PlayerController player, Transform target, int targetFloor)
        {
            _isTransitioning = true;

            // Optional audio
            if (transitionSound != null)
                AudioSource.PlayClipAtPoint(transitionSound, player.transform.position);

            Vector3 startPos = player.transform.position;
            Vector3 endPos   = target.position;

            // Disable CharacterController during lerp
            CharacterController cc = player.GetComponent<CharacterController>();
            if (cc != null) cc.enabled = false;

            float elapsed = 0f;
            while (elapsed < transitionDuration)
            {
                elapsed += Time.deltaTime;
                float t = moveCurve.Evaluate(elapsed / transitionDuration);
                player.transform.position = Vector3.Lerp(startPos, endPos, t);
                yield return null;
            }

            player.transform.position = endPos;

            if (cc != null) cc.enabled = true;

            // Update GameManager floor
            if (GameManager.Instance != null)
                GameManager.Instance.CurrentFloor = targetFloor;

            _isTransitioning = false;
        }
    }
}
