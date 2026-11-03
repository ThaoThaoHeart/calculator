import { useEffect, useState } from 'react'
import './App.css'

type Operator = '+' | '-' | 'x' | '÷'

const DIGIT_ROWS: string[][] = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', '.'],
]

const OPERATORS: Operator[] = ['÷', 'x', '-', '+']

const formatValue = (value: number): string => {
  if (!Number.isFinite(value)) {
    return 'Error'
  }

  const normalized = Math.abs(value) < 1e-12 ? 0 : value
  return Number(normalized.toPrecision(12)).toString()
}

const performCalculation = (
  left: number,
  right: number,
  operator: Operator,
): number => {
  switch (operator) {
    case '+':
      return left + right
    case '-':
      return left - right
    case 'x':
      return left * right
    case '÷':
      if (right === 0) {
        return Number.NaN
      }
      return left / right
  }
}

function App() {
  const [display, setDisplay] = useState('0')
  const [storedValue, setStoredValue] = useState<number | null>(null)
  const [pendingOperator, setPendingOperator] = useState<Operator | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [equation, setEquation] = useState('')
  const [lockedResult, setLockedResult] = useState<string | null>(null)
  const [isPaywallOpen, setIsPaywallOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'processing' | 'success'
  >('idle')

  const resetPaywall = () => {
    setLockedResult(null)
    setIsPaywallOpen(false)
    setPaymentStatus('idle')
  }

  const clearAll = () => {
    setDisplay('0')
    setStoredValue(null)
    setPendingOperator(null)
    setWaitingForOperand(false)
    setEquation('')
    resetPaywall()
  }

  const appendDigit = (digit: string) => {
    if (lockedResult !== null) {
      resetPaywall()
      setDisplay(digit)
      setWaitingForOperand(false)
      setEquation('')
      return
    }

    if (display === 'Error') {
      setDisplay(digit)
      setWaitingForOperand(false)
      return
    }

    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
      return
    }

    setDisplay((current) => (current === '0' ? digit : current + digit))
  }

  const appendDecimal = () => {
    if (lockedResult !== null) {
      resetPaywall()
      setDisplay('0.')
      setWaitingForOperand(false)
      setEquation('')
      return
    }

    if (display === 'Error') {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }

    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }

    if (!display.includes('.')) {
      setDisplay((current) => `${current}.`)
    }
  }

  const chooseOperator = (operator: Operator) => {
    if (display === 'Error' || lockedResult !== null) {
      return
    }

    const inputValue = Number.parseFloat(display)

    if (storedValue === null) {
      setStoredValue(inputValue)
      setEquation(`${formatValue(inputValue)} ${operator}`)
    } else if (pendingOperator && !waitingForOperand) {
      const result = performCalculation(storedValue, inputValue, pendingOperator)
      const formattedResult = formatValue(result)
      setDisplay(formattedResult)
      setStoredValue(Number.parseFloat(formattedResult))
      setEquation(`${formattedResult} ${operator}`)
    } else {
      setEquation(`${formatValue(storedValue)} ${operator}`)
    }

    setPendingOperator(operator)
    setWaitingForOperand(true)
  }

  const calculateResult = () => {
    if (
      display === 'Error' ||
      storedValue === null ||
      pendingOperator === null ||
      lockedResult !== null
    ) {
      return
    }

    const inputValue = Number.parseFloat(display)
    const result = performCalculation(storedValue, inputValue, pendingOperator)
    const formattedResult = formatValue(result)

    setEquation(
      `${formatValue(storedValue)} ${pendingOperator} ${formatValue(inputValue)} =`,
    )

    if (formattedResult === 'Error') {
      setDisplay(formattedResult)
      resetPaywall()
    } else {
      setDisplay('••••')
      setLockedResult(formattedResult)
      setIsPaywallOpen(true)
      setPaymentStatus('idle')
    }

    setStoredValue(null)
    setPendingOperator(null)
    setWaitingForOperand(true)
  }

  const unlockAnswer = () => {
    if (lockedResult === null || paymentStatus === 'processing') {
      return
    }

    setPaymentStatus('processing')
    window.setTimeout(() => {
      setPaymentStatus('success')
      setDisplay(lockedResult)
      setLockedResult(null)
      setIsPaywallOpen(false)
    }, 1300)
  }

  const deleteLast = () => {
    if (lockedResult !== null) {
      resetPaywall()
      setDisplay('0')
      setEquation('')
      return
    }

    if (display === 'Error') {
      clearAll()
      return
    }

    if (waitingForOperand) {
      return
    }

    setDisplay((current) => {
      if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
        return '0'
      }
      return current.slice(0, -1)
    })
  }

  const toggleSign = () => {
    if (display === '0' || display === 'Error' || lockedResult !== null || waitingForOperand) {
      return
    }
    setDisplay((current) => (current.startsWith('-') ? current.slice(1) : `-${current}`))
  }

  const toPercent = () => {
    if (display === 'Error' || lockedResult !== null || waitingForOperand) {
      return
    }

    const next = Number.parseFloat(display) / 100
    setDisplay(formatValue(next))
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { key } = event

      if (/^[0-9]$/.test(key)) {
        event.preventDefault()
        appendDigit(key)
        return
      }

      if (key === '.') {
        event.preventDefault()
        appendDecimal()
        return
      }

      if (key === '+' || key === '-') {
        event.preventDefault()
        chooseOperator(key)
        return
      }

      if (key === '*') {
        event.preventDefault()
        chooseOperator('x')
        return
      }

      if (key === '/') {
        event.preventDefault()
        chooseOperator('÷')
        return
      }

      if (key === 'Enter' || key === '=') {
        event.preventDefault()
        if (isPaywallOpen && lockedResult !== null) {
          unlockAnswer()
        } else {
          calculateResult()
        }
        return
      }

      if (key === 'Backspace') {
        event.preventDefault()
        deleteLast()
        return
      }

      if (key === 'Escape') {
        event.preventDefault()
        clearAll()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <main className="app-shell">
      <section className="calculator" aria-label="Calculator">
        <header className="calc-header">
          <p className="calc-kicker">Modern Calculator</p>
          <h1>Compute with style</h1>
        </header>

        <section className="display-panel" aria-live="polite">
          <p className="equation">{equation || 'Ready'}</p>
          <p className="display" role="status">
            {display}
          </p>
        </section>

        {lockedResult !== null && (
          <p className="locked-note" role="status">
            Answer locked. Complete payment to reveal.
          </p>
        )}

        <div className="button-grid" role="group" aria-label="Calculator keypad">
          <button type="button" className="btn btn-function" onClick={clearAll}>
            AC
          </button>
          <button type="button" className="btn btn-function" onClick={deleteLast}>
            DEL
          </button>
          <button type="button" className="btn btn-function" onClick={toPercent}>
            %
          </button>
          <button type="button" className="btn btn-operator" onClick={() => chooseOperator('÷')}>
            ÷
          </button>

          {DIGIT_ROWS.map((row, rowIndex) => (
            <div className="digit-row" key={row.join('')}>
              {row.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`btn ${item === '0' && rowIndex === 3 ? 'btn-zero' : 'btn-number'}`}
                  onClick={item === '.' ? appendDecimal : () => appendDigit(item)}
                >
                  {item}
                </button>
              ))}
              {rowIndex < OPERATORS.length && (
                <button
                  type="button"
                  className="btn btn-operator"
                  onClick={() => chooseOperator(OPERATORS[rowIndex])}
                >
                  {OPERATORS[rowIndex]}
                </button>
              )}
            </div>
          ))}

          <button type="button" className="btn btn-function" onClick={toggleSign}>
            +/−
          </button>
          <button type="button" className="btn btn-equals" onClick={calculateResult}>
            =
          </button>
        </div>

        {isPaywallOpen && lockedResult !== null && (
          <section className="paywall" aria-label="Answer paywall">
            <p className="paywall-title">Unlock This Answer</p>
            <p className="paywall-copy">One-time unlock to view the final result.</p>
            <div className="paywall-card" aria-hidden="true">
              <p>Card ending in 4242</p>
              <p>Amount: $0.99</p>
            </div>
            <button
              type="button"
              className="pay-button"
              onClick={unlockAnswer}
              disabled={paymentStatus === 'processing'}
            >
              {paymentStatus === 'processing' ? 'Processing...' : 'Pay $0.99'}
            </button>
            {paymentStatus === 'success' && (
              <p className="paywall-success">Payment successful. Revealing answer...</p>
            )}
          </section>
        )}
      </section>
    </main>
  )
}

export default App
