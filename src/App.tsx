import { BrowserRouter } from 'react-router-dom'
import RouterSetup from '@components/Router/RouterSetup'

const App = () => {
    return (
        <BrowserRouter>
            <RouterSetup />
        </BrowserRouter>
    )
}

export default App
