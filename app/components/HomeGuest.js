import React, { useEffect, useContext } from "react"
import Page from "./Page"
import Axios from "axios"
import { useImmerReducer } from "use-immer"
import DispatchContext from "../DispatchContext"

function HomeGuest() {
  const appDispatch = useContext(DispatchContext)

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    },
    submitCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        if (draft.username.value != action.value) draft.username.hasErrors = false
        draft.username.value = action.value
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true
          draft.username.message = "Username cannot exceed 30 characters."
        }
        if (draft.username.value && !/^([a-zA-Z0-9.]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true
          draft.username.message = "Username can only contain letters and numbers."
        }
        return
      case "usernameAfterDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true
          draft.username.message = "Username must be at least 3 characters."
        }
        if (!draft.username.hasErrors) draft.username.checkCount++
        return
      case "usernameUniqueResults":
        if (action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.message = "That username is already taken."
        } else draft.username.isUnique = true
        return
      case "emailImmediately":
        if (draft.email.value != action.value) draft.email.hasErrors = false
        draft.email.value = action.value
        return
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.message = "You must provide a valid email address."
        }
        if (!draft.email.hasErrors) draft.email.checkCount++
        return
      case "emailUniqueResults":
        if (action.value) {
          draft.email.hasErrors = true
          draft.email.isUnique = false
          draft.email.message = "That email is already being used."
        } else draft.email.isUnique = true
        return
      case "passwordImmediately":
        draft.password.hasErrors = false
        draft.password.value = action.value
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true
          draft.password.message = "Password cannot exceed 50 characters."
        }
        return
      case "passwordAfterDelay":
        if (draft.password.value.length < 6) {
          draft.password.hasErrors = true
          draft.password.message = "Password must be at least 6 characters."
        }
        return
      case "submitForm":
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors) draft.submitCount++
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: "emailAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.password.value])

  useEffect(() => {
    if (state.username.checkCount) {
      const ourRequest = Axios.CancelToken.source()
      const fetchResults = async () => {
        try {
          const response = await Axios.post("/doesUsernameExist", { username: state.username.value }, { cancelToken: ourRequest.token })
          dispatch({ type: "usernameUniqueResults", value: response.data })
        } catch (e) {
          console.log("There was a problem or the request was cancelled.")
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.username.checkCount])

  useEffect(() => {
    if (state.email.checkCount) {
      const ourRequest = Axios.CancelToken.source()
      const fetchResults = async () => {
        try {
          const response = await Axios.post("/doesEmailExist", { email: state.email.value }, { cancelToken: ourRequest.token })
          dispatch({ type: "emailUniqueResults", value: response.data })
        } catch (e) {
          console.log("There was a problem or the request was cancelled.")
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.email.checkCount])

  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/register", { username: state.username.value, email: state.email.value, password: state.password.value }, { cancelToken: ourRequest.token })
          appDispatch({ type: "login", data: response.data })
          appDispatch({ type: "flashMessage", value: "Congrats! Welcome to your new account.", color: "success" })
        } catch (e) {
          console.log("There was a problem or the request was cancelled.")
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "usernameImmediately", value: state.username.value })
    dispatch({ type: "usernameAfterDelay", value: state.username.value })
    dispatch({ type: "emailImmediately", value: state.email.value })
    dispatch({ type: "emailAfterDelay", value: state.email.value })
    dispatch({ type: "passwordImmediately", value: state.password.value })
    dispatch({ type: "passwordAfterDelay", value: state.password.value })
    dispatch({ type: "submitForm" })
  }

  return (
    <Page title="Welcome!" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input onChange={e => dispatch({ type: "usernameImmediately", value: e.target.value })} id="username-register" name="username" className={`form-control ${state.username.hasErrors && "is-invalid"}`} type="text" placeholder="Pick a username" autoComplete="off" />
              {state.username.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={e => dispatch({ type: "emailImmediately", value: e.target.value })} id="email-register" name="email" className={`form-control ${state.email.hasErrors && "is-invalid"}`} type="text" placeholder="you@example.com" autoComplete="off" />
              {state.email.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={e => dispatch({ type: "passwordImmediately", value: e.target.value })} id="password-register" name="password" className={`form-control ${state.password.hasErrors && "is-invalid"}`} type="password" placeholder="Create a password" />
              {state.password.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>}
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for SocialApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default HomeGuest
