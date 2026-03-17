using UnityEngine;
using TMPro;

namespace Asylum.UI
{
    /// <summary>
    /// Screen-space interaction prompt, e.g. "[E] Open Door".
    /// Controlled by InteractionSystem — call Show/Hide.
    ///
    /// Setup:
    ///   Canvas (Screen Space - Overlay)
    ///     └─ PromptPanel (this script)
    ///         └─ TMP_Text (promptText)
    /// </summary>
    public class InteractionPromptUI : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private TMP_Text promptText;

        [Header("Animation")]
        [SerializeField] private float fadeSpeed = 10f;

        private bool _visible;
        private float _targetAlpha;

        private void Awake()
        {
            if (canvasGroup == null)
                canvasGroup = GetComponent<CanvasGroup>();

            // Start hidden
            if (canvasGroup != null)
                canvasGroup.alpha = 0f;

            _targetAlpha = 0f;
        }

        private void Update()
        {
            if (canvasGroup == null) return;

            canvasGroup.alpha = Mathf.MoveTowards(
                canvasGroup.alpha, _targetAlpha, fadeSpeed * Time.deltaTime);
        }

        /// <summary>
        /// Show the prompt with the given text (e.g. "[E] Open Door").
        /// </summary>
        public void Show(string text)
        {
            if (promptText != null)
                promptText.text = text;

            _targetAlpha = 1f;
            _visible = true;

            if (canvasGroup != null)
            {
                canvasGroup.interactable   = true;
                canvasGroup.blocksRaycasts = false;
            }
        }

        /// <summary>
        /// Hide the prompt with a smooth fade-out.
        /// </summary>
        public void Hide()
        {
            _targetAlpha = 0f;
            _visible = false;

            if (canvasGroup != null)
            {
                canvasGroup.interactable   = false;
                canvasGroup.blocksRaycasts = false;
            }
        }

        public bool IsVisible => _visible;
    }
}
