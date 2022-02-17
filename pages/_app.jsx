import '../styles/globals.css'
import Navbar from '../components/Navbar'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <main className="container">
        <Component {...pageProps} />
      </main>
    </>
  )
}

export default MyApp
