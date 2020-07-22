import React, { useState, useContext, useEffect } from "react"
import Axios from "axios"
import DispatchContext from "../DispatchContext"

const HeaderLoggedOut = () => {
  const appDispatch = useContext(DispatchContext)
  const [username, setUsername] = useState("")
  const [usernameHasError, setUsernameHasError] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordHasError, setPasswordHasError] = useState(false)

  const checkLength = value => (value.length > 0 ? true : false)

  const handleUsername = e => {
    if (!checkLength(e.target.value)) setUsernameHasError(true)
    else {
      setUsernameHasError(false)
      setUsername(e.target.value)
    }
  }

  const handlePassword = e => {
    if (!checkLength(e.target.value)) setPasswordHasError(true)
    else {
      setPasswordHasError(false)
      setPassword(e.target.value)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!checkLength(username)) setUsernameHasError(true)
    if (!checkLength(password)) setPasswordHasError(true)
    if (checkLength(username) && checkLength(password)) {
      try {
        const response = await Axios.post("/login", { username, password })
        if (response.data) {
          appDispatch({ type: "login", data: response.data })
          appDispatch({ type: "flashMessage", value: "You have successfully logged in.", color: "success" })
        } else {
          appDispatch({ type: "flashMessage", value: "Invalid username / password.", color: "danger" })
        }
      } catch (e) {
        console.log("There was a problem.")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={handleUsername} name="username" className={`form-control form-control-sm input-dark ${usernameHasError && "is-invalid"}`} type="text" placeholder="Username" autoComplete="off" />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input onChange={handlePassword} name="password" className={`form-control form-control-sm input-dark ${passwordHasError && "is-invalid"}`} type="password" placeholder="Password" />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  )
}

export default HeaderLoggedOut
