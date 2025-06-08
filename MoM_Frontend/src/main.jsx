import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './components/Home/Home.jsx'
import About from './components/About/About.jsx'
//import Contact from './components/Contact/Contact.jsx'
import User from './components/User/user.jsx'
import Features from './components/Features/Features.jsx'
import FAQ from './components/FAQ/FAQ.jsx'
import Blog from './components/Blog/Blog.jsx'
import TermsOfService from './components/TermsOfServices/TermsOfServices.jsx'
// import Github from './components/Github/Github.jsx'
import Github, { githubInfoLoader } from './components/Github/Github.jsx'
import Manual from './components/Manual/Manual.jsx'
import Automated from './components/Automated/Automated.jsx'
import { AuthProvider } from './context/AuthContext'


// const router = createBrowserRouter([
//   {
//     path:'/',
//     element: <Layout/>,
//     children: [
//       {
//         path:"",
//         element:<Home/> 
//       },
//       {
//         path:"about",
//         element:<About /> 
//       },
//       {
//         path:"contact",
//         element:<Contact /> 
//       }
//     ]
//   }
// ])

const router = createBrowserRouter(
  createRoutesFromElements(
      <Route path='/' element= {<Layout />}>
      <Route path='' element={<Home />}/>
      <Route path='about' element={<About />}/>
      {/* <Route path='contact' element={<Contact />}/> */}
      <Route path='user/:userid' element={<User />}/>
      <Route path='features' element={<Features />}/>
      <Route path='faq' element={<FAQ />}/>
      <Route path='blog' element={<Blog />}/>
      <Route path='terms' element={<TermsOfService />}/>
      <Route path='manual' element={<Manual />}/>
      <Route path='automated' element={<Automated />}/>


      {/* <Route path='github' element={<Github />}/> */}

      <Route 
      loader={githubInfoLoader}
      path='github' 
      element={<Github />}
       />
     </Route>
  )
)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <RouterProvider router = {router} />
    </AuthProvider>
  </StrictMode>,
)
