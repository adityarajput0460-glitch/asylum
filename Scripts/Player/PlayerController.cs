using UnityEngine;

namespace Asylum.Core
{
    /// <summary>
    /// First-person player controller using CharacterController.
    /// Handles WASD movement, sprint (Shift), crouch (C), and gravity.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        // ──────────────────────────── Movement Settings ────────────────────
        [Header("Movement")]
        [SerializeField] private float walkSpeed     = 3.5f;
        [SerializeField] private float sprintSpeed   = 6.0f;
        [SerializeField] private float crouchSpeed   = 1.8f;

        [Header("Crouch")]
        [SerializeField] private float standHeight   = 2.0f;
        [SerializeField] private float crouchHeight  = 1.2f;
        [SerializeField] private float crouchSmooth  = 8f;

        [Header("Gravity")]
        [SerializeField] private float gravity       = -19.62f;
        [SerializeField] private float groundCheckDistance = 0.3f;
        [SerializeField] private LayerMask groundMask;

        // ──────────────────────────── Camera Reference ─────────────────────
        [Header("Camera")]
        [SerializeField] private Transform cameraHolder;
        [SerializeField] private float standCameraY   = 0.85f;
        [SerializeField] private float crouchCameraY  = 0.35f;

        // ──────────────────────────── Runtime State ────────────────────────
        private CharacterController _cc;
        private Vector3 _velocity;
        private bool _isGrounded;
        private bool _isCrouching;
        private bool _isSprinting;
        private float _targetHeight;

        // ──────────────────────────── Public Accessors ─────────────────────
        public bool IsGrounded  => _isGrounded;
        public bool IsCrouching => _isCrouching;
        public bool IsSprinting => _isSprinting;
        public bool IsMoving    => _horizontalInput != Vector2.zero;
        public float CurrentSpeed { get; private set; }

        private Vector2 _horizontalInput;

        // ──────────────────────────── Lifecycle ────────────────────────────
        private void Awake()
        {
            _cc = GetComponent<CharacterController>();
            _targetHeight = standHeight;
        }

        private void Update()
        {
            GroundCheck();
            HandleInput();
            ApplyMovement();
            HandleCrouch();
        }

        // ──────────────────────────── Ground Check ─────────────────────────
        private void GroundCheck()
        {
            // Sphere cast from bottom of controller
            Vector3 origin = transform.position + Vector3.up * (_cc.radius);
            _isGrounded = Physics.SphereCast(origin, _cc.radius * 0.9f, Vector3.down,
                                             out _, groundCheckDistance, groundMask);

            if (_isGrounded && _velocity.y < 0f)
                _velocity.y = -2f; // small downward force to stay grounded
        }

        // ──────────────────────────── Input ────────────────────────────────
        private void HandleInput()
        {
            float h = Input.GetAxisRaw("Horizontal");
            float v = Input.GetAxisRaw("Vertical");
            _horizontalInput = new Vector2(h, v);

            _isSprinting = Input.GetKey(KeyCode.LeftShift) && !_isCrouching && v > 0f;

            if (Input.GetKeyDown(KeyCode.C))
                ToggleCrouch();
        }

        // ──────────────────────────── Movement ─────────────────────────────
        private void ApplyMovement()
        {
            // Choose speed tier
            float speed = _isCrouching ? crouchSpeed
                        : _isSprinting ? sprintSpeed
                        : walkSpeed;

            Vector3 direction = transform.right * _horizontalInput.x
                              + transform.forward * _horizontalInput.y;

            if (direction.sqrMagnitude > 1f)
                direction.Normalize();

            Vector3 move = direction * speed;
            CurrentSpeed = move.magnitude;

            // Gravity
            _velocity.y += gravity * Time.deltaTime;

            // Final move
            _cc.Move((move + _velocity) * Time.deltaTime);
        }

        // ──────────────────────────── Crouch ───────────────────────────────
        private void ToggleCrouch()
        {
            if (_isCrouching)
            {
                // Check if there is room to stand up
                if (Physics.Raycast(transform.position, Vector3.up, standHeight + 0.1f, groundMask))
                    return; // blocked

                _isCrouching = false;
                _targetHeight = standHeight;
            }
            else
            {
                _isCrouching = true;
                _isSprinting = false;
                _targetHeight = crouchHeight;
            }
        }

        private void HandleCrouch()
        {
            float currentHeight = _cc.height;
            if (Mathf.Abs(currentHeight - _targetHeight) < 0.01f)
                return;

            float newHeight = Mathf.Lerp(currentHeight, _targetHeight, crouchSmooth * Time.deltaTime);
            float deltaHeight = newHeight - currentHeight;

            _cc.height = newHeight;
            _cc.center = new Vector3(0f, newHeight / 2f, 0f);

            // Move the controller so the feet stay on the ground
            transform.position += new Vector3(0f, deltaHeight / 2f, 0f);

            // Adjust camera holder
            if (cameraHolder != null)
            {
                float targetCamY = _isCrouching ? crouchCameraY : standCameraY;
                Vector3 camPos = cameraHolder.localPosition;
                camPos.y = Mathf.Lerp(camPos.y, targetCamY, crouchSmooth * Time.deltaTime);
                cameraHolder.localPosition = camPos;
            }
        }

        // ──────────────────────────── Public Helpers ───────────────────────
        /// <summary>
        /// Teleport the player to a world position (used by StaircaseController).
        /// </summary>
        public void TeleportTo(Vector3 worldPosition)
        {
            _cc.enabled = false;
            transform.position = worldPosition;
            _cc.enabled = true;
        }
    }
}
