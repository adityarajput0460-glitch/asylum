using UnityEngine;

namespace Asylum.Core
{
    /// <summary>
    /// Surface-based footstep audio system.
    /// Raycasts downward to detect surface type by tag, then plays a clip from
    /// the matching audio array at an interval driven by movement speed.
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public class FootstepSystem : MonoBehaviour
    {
        // ──────────────────────────── References ───────────────────────────
        [Header("References")]
        [SerializeField] private PlayerController playerController;

        // ──────────────────────────── Raycast ──────────────────────────────
        [Header("Surface Detection")]
        [SerializeField] private float rayDistance = 1.5f;
        [SerializeField] private LayerMask groundMask;

        // ──────────────────────────── Audio Clips ──────────────────────────
        [Header("Footstep Clips")]
        [SerializeField] private AudioClip[] stoneClips;
        [SerializeField] private AudioClip[] woodClips;
        [SerializeField] private AudioClip[] tileClips;
        [SerializeField] private AudioClip[] carpetClips;
        [SerializeField] private AudioClip[] defaultClips; // fallback

        // ──────────────────────────── Timing ───────────────────────────────
        [Header("Step Intervals")]
        [SerializeField] private float walkStepInterval   = 0.5f;
        [SerializeField] private float sprintStepInterval = 0.32f;
        [SerializeField] private float crouchStepInterval = 0.7f;

        [Header("Volume")]
        [SerializeField] private float walkVolume   = 0.5f;
        [SerializeField] private float sprintVolume = 0.7f;
        [SerializeField] private float crouchVolume = 0.25f;

        // ──────────────────────────── Runtime ──────────────────────────────
        private AudioSource _audioSource;
        private float _stepTimer;

        private void Awake()
        {
            _audioSource = GetComponent<AudioSource>();
            _audioSource.playOnAwake = false;
            _audioSource.spatialBlend = 1f; // 3D sound
        }

        private void Update()
        {
            if (playerController == null) return;

            if (!playerController.IsMoving || !playerController.IsGrounded)
            {
                _stepTimer = 0f;
                return;
            }

            // Choose interval
            float interval = playerController.IsCrouching ? crouchStepInterval
                           : playerController.IsSprinting ? sprintStepInterval
                           : walkStepInterval;

            _stepTimer += Time.deltaTime;

            if (_stepTimer >= interval)
            {
                _stepTimer = 0f;
                PlayFootstep();
            }
        }

        private void PlayFootstep()
        {
            AudioClip[] clips = DetectSurface();
            if (clips == null || clips.Length == 0) return;

            AudioClip clip = clips[Random.Range(0, clips.Length)];

            float volume = playerController.IsCrouching ? crouchVolume
                         : playerController.IsSprinting ? sprintVolume
                         : walkVolume;

            // Slight pitch variation for realism
            _audioSource.pitch = Random.Range(0.9f, 1.1f);
            _audioSource.PlayOneShot(clip, volume);
        }

        private AudioClip[] DetectSurface()
        {
            Ray ray = new Ray(transform.position + Vector3.up * 0.1f, Vector3.down);

            if (Physics.Raycast(ray, out RaycastHit hit, rayDistance, groundMask))
            {
                string tag = hit.collider.tag;

                return tag switch
                {
                    "Stone"  => stoneClips,
                    "Wood"   => woodClips,
                    "Tile"   => tileClips,
                    "Carpet" => carpetClips,
                    _        => defaultClips,
                };
            }

            return defaultClips;
        }
    }
}
