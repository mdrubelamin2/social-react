import React, { useEffect, useState, useContext } from "react"
import Axios from "axios"
import { useParams, Link, withRouter } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

const ProfilePosts = props => {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!appState.loggedIn) {
      appDispatch({
        type: "flashMessage",
        value: "You must log in to view this page."
      })
      props.history.push("/")
    }

    const ourRequest = Axios.CancelToken.source()

    const fetchPosts = async () => {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { cancelToken: ourRequest.token })
        setPosts(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("There was a problem.")
      }
    }
    fetchPosts()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  if (isLoading) return <LoadingDotsIcon />

  return (
    <div className="list-group">
      {posts &&
        posts.map(post => {
          const date = new Date(post.createdDate)
          const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

          return (
            <Link key={post._id} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
              <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong> <span className="text-muted small">on {dateFormatted} </span>
            </Link>
          )
        })}
    </div>
  )
}

export default withRouter(ProfilePosts)
