import { Link } from 'react-router-dom'

function App() {
  return (
    <main className="landing-page">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link className="wordmark" to="/">
          Flow<span>line</span>
        </Link>
        <Link className="nav-link" to="/dashboard">
          Dashboard <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      <section className="hero-section">
        <p className="eyebrow">Workflow orchestration, clarified</p>
        <h1>Make every<br /><em>move</em> count.</h1>
        <div className="hero-footer">
          <p>Build dependable systems from the first trigger to the final handoff.</p>
          <Link className="primary-button" to="/workflows">
            Get started <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <div className="signal-row" aria-hidden="true">
        <span>01 / CONNECT</span>
        <span className="signal-line" />
        <span>02 / AUTOMATE</span>
        <span className="signal-line" />
        <span>03 / DELIVER</span>
      </div>
    </main>
  )
}

export default App
