using UnityEngine;

namespace Asylum.Core
{
    /// <summary>
    /// Sinusoidal head bob that adjusts based on walk / sprint / crouch speed.
    /// Attach to the camera holder (child of the player).
    /// </summary>
    public class HeadBob : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private PlayerController playerController;

        [Header("Bob Parameters — Walk")]
        [SerializeField] private float walkBobSpeed     = 10f;
        [SerializeField] private float walkBobAmplitude = 0.03f;

        [Header("Bob Parameters — Sprint")]
        [SerializeField] private float sprintBobSpeed     = 14f;
        [SerializeField] private float sprintBobAmplitude = 0.055f;

        [Header("Bob Parameters — Crouch")]
        [SerializeField] private float crouchBobSpeed     = 7f;
        [SerializeField] private float crouchBobAmplitude = 0.015f;

        [Header("Smoothing")]
        [SerializeField] private float returnSpeed    = 6f;  // how fast it returns to center
        [SerializeField] private float horizontalMul  = 0.5f; // horizontal sway multiplier

        private float _timer;
        private Vector3 _restPosition;

        private void Start()
        {
            _restPosition = transform.localPosition;
        }

        private void Update()
        {
            if (playerController == null) return;

            if (!playerController.IsMoving || !playerController.IsGrounded)
            {
                // Smoothly return to rest
                _timer = 0f;
                transform.localPosition = Vector3.Lerp(
                    transform.localPosition, _restPosition, returnSpeed * Time.deltaTime);
                return;
            }

            // Choose bob profile
            float speed, amplitude;
            if (playerController.IsCrouching)
            {
                speed     = crouchBobSpeed;
                amplitude = crouchBobAmplitude;
            }
            else if (playerController.IsSprinting)
            {
                speed     = sprintBobSpeed;
                amplitude = sprintBobAmplitude;
            }
            else
            {
                speed     = walkBobSpeed;
                amplitude = walkBobAmplitude;
            }

            _timer += Time.deltaTime * speed;

            float bobY = Mathf.Sin(_timer) * amplitude;
            float bobX = Mathf.Cos(_timer * 0.5f) * amplitude * horizontalMul;

            Vector3 target = _restPosition + new Vector3(bobX, bobY, 0f);
            transform.localPosition = Vector3.Lerp(
                transform.localPosition, target, returnSpeed * Time.deltaTime);
        }
    }
}
