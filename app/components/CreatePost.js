import React, { useContext, useEffect } from "react"
import { useImmerReducer } from "use-immer"
import Page from "./Page"
import Axios from "axios"
import { withRouter } from "react-router-dom"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

const CreatePost = props => {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  useEffect(() => {
    if (!appState.loggedIn) {
      appDispatch({
        type: "flashMessage",
        value: "You must log in to view this page.",
        color: "danger"
      })
      props.history.push("/")
    }
  }, [])

  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    cantSave: true,
    sendCount: 0
  }

  const createPostReducer = (draft, action) => {
    switch (action.type) {
      case "titleChange":
        draft.title.hasErrors = false
        draft.title.value = action.value
        if (draft.title.value && draft.body.value) draft.cantSave = false
        return
      case "bodyChange":
        draft.body.hasErrors = false
        draft.body.value = action.value
        if (draft.title.value && draft.body.value) draft.cantSave = false
        return
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.cantSave = true
          draft.title.message = "You must provide a title."
        }
        return
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.cantSave = true
          draft.body.message = "You must provide body content."
        }
        return
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors && !draft.cantSave) {
          draft.cantSave = true
          draft.sendCount++
        }
        return
      case "saveRequestStarted":
        draft.cantSave = true
        return
    }
  }

  const [state, dispatch] = useImmerReducer(createPostReducer, originalState)

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" })
      const createPost = async () => {
        try {
          const response = await Axios.post("/create-post", {
            title: state.title.value,
            body: state.body.value,
            token: appState.user.token
          })
          appDispatch({
            type: "flashMessage",
            value: "Congrats, you created a new post.",
            color: "success"
          })
          props.history.push(`/post/${response.data}`)
        } catch (e) {
          console.log("There was a problem.")
        }
      }
      createPost()
    }
  }, [state.sendCount])

  const submitHandler = e => {
    e.preventDefault()
    dispatch({ type: "titleRules", value: state.title.value })
    dispatch({ type: "bodyRules", value: state.body.value })
    dispatch({ type: "submitRequest" })
  }

  return (
    <Page title="Create New Post">
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={e => dispatch({ type: "titleRules", value: e.target.value })} onChange={e => dispatch({ type: "titleChange", value: e.target.value })} autoFocus name="title" id="post-title" className={`form-control form-control-lg form-control-title ${state.title.hasErrors && "is-invalid"}`} type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={e => dispatch({ type: "bodyRules", value: e.target.value })} onChange={e => dispatch({ type: "bodyChange", value: e.target.value })} name="body" id="post-body" className={`body-content tall-textarea form-control ${state.body.hasErrors && "is-invalid"}`} type="text"></textarea>
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}
        </div>

        <button className="btn btn-primary" disabled={state.cantSave}>
          Save New Post
        </button>
      </form>
    </Page>
  )
}

export default withRouter(CreatePost)
