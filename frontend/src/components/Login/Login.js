import React from 'react'
import LoginForm from './LoginForm'
import { sendUsersAuthRequest } from '../../api-helpers/api-helpers'
import { useDispatch } from 'react-redux'
import { adminActions, userActions } from '../../store'

const Login = () => {
  const dispatch = useDispatch()
  const getData = (data) => {
    let userType;
    let userId;
    let adminToken;
    sendUsersAuthRequest(data.inputs, data.signup)
    .then((res) => {
      console.log(res)
      userType = res.userType
      userId = res.id
      adminToken = (userType === 'admin' ? res.token : "")
    })
    .then(() => {
      if(userType === 'admin') {
        dispatch(adminActions.login())
        localStorage.setItem("adminId", userId)
        localStorage.setItem("token", adminToken)
      } else if(userType === 'user') {
        dispatch(userActions.login())
        localStorage.setItem("userId", userId)
      }
    })
    .catch((err) => console.log(err))
  }
  return (
    <div>
      <LoginForm onSubmit={getData} />
    </div>
  )
}

export default Login