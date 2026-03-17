using UnityEngine;

namespace Asylum.Core
{
    /// <summary>
    /// Mouse look — rotates the player body horizontally and the camera vertically.
    /// Attach to the same GameObject as PlayerController.
    /// </summary>
    public class MouseLook : MonoBehaviour
    {
        [Header("Sensitivity")]
        [SerializeField] private float mouseSensitivity = 2.0f;

        [Header("Clamp")]
        [SerializeField] private float minVerticalAngle = -85f;
        [SerializeField] private float maxVerticalAngle = 85f;

        [Header("References")]
        [SerializeField] private Transform cameraHolder;

        [Header("Smoothing")]
        [SerializeField] private float smoothing = 1.5f;

        private float _xRotation;
        private float _smoothedMouseX;
        private float _smoothedMouseY;
        private float _currentVelocityX;
        private float _currentVelocityY;

        private void Start()
        {
            Cursor.lockState = CursorLockMode.Locked;
            Cursor.visible   = false;
        }

        private void Update()
        {
            float mouseX = Input.GetAxisRaw("Mouse X") * mouseSensitivity;
            float mouseY = Input.GetAxisRaw("Mouse Y") * mouseSensitivity;

            // Optional smoothing
            _smoothedMouseX = Mathf.SmoothDamp(_smoothedMouseX, mouseX, ref _currentVelocityX, 1f / smoothing);
            _smoothedMouseY = Mathf.SmoothDamp(_smoothedMouseY, mouseY, ref _currentVelocityY, 1f / smoothing);

            // Vertical rotation (camera)
            _xRotation -= _smoothedMouseY;
            _xRotation  = Mathf.Clamp(_xRotation, minVerticalAngle, maxVerticalAngle);

            if (cameraHolder != null)
                cameraHolder.localRotation = Quaternion.Euler(_xRotation, 0f, 0f);

            // Horizontal rotation (player body)
            transform.Rotate(Vector3.up * _smoothedMouseX);
        }

        /// <summary>
        /// Call this to unlock/relock the cursor (e.g. pause menu).
        /// </summary>
        public void SetCursorLock(bool locked)
        {
            Cursor.lockState = locked ? CursorLockMode.Locked : CursorLockMode.None;
            Cursor.visible   = !locked;
        }
    }
}
