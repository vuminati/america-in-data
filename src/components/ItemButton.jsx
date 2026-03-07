/**
 * @param {Object}      item         - { display_name, ... }
 * @param {Function}    onClick      - Called when the button is clicked (idle state only)
 * @param {'idle'|'correct'|'incorrect'|'dimmed'} state
 * @param {boolean}     revealed     - Whether to show the value
 * @param {string}      displayValue - Pre-formatted value string to show when revealed
 * @param {string|null} subValue     - Optional second line shown below the main value
 */
export default function ItemButton({ item, onClick, state, revealed, displayValue, subValue }) {
  return (
    <button
      className={`item-button item-button--${state}`}
      onClick={state === 'idle' ? onClick : undefined}
      aria-pressed={state !== 'idle' && revealed}
    >
      <span className="item-name">{item.display_name}</span>
      {revealed && (
        <>
          <span className="item-value">{displayValue}</span>
          {subValue && <span className="item-value item-value--sub">{subValue}</span>}
        </>
      )}
    </button>
  )
}
