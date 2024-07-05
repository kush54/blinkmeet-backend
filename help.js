let allUsers = [];
let upChatUsers = [];
let upVideoUsers = [];


 const addNewUser = ({ id, sid }) => {
  const existingUser = allUsers.find((user) => user.id === id);
  const _existingUser = allUsers.find((user) => user.sid === sid);
  if (existingUser) {
    return { error: "user id already taken" };
  }
  if (_existingUser) {
    removeUser(sid);
  }
  const user = { id:id, sid:sid };
  allUsers.push(user);
  return { user };
};

const removeUser = (sid) => {
  const allOnlineUsers = [...allUsers]
  const filteredOnlineUsers = allUsers.filter(user => user.sid !== sid)

  allUsers = filteredOnlineUsers

  return allOnlineUsers.find((user) => user.sid === sid)
};

const addupChatUsers = (userId) => {
  const existingUser = upChatUsers.find(user => user === userId)

  if (existingUser) {
      return { error: "User already unPaired" }
  }

  upChatUsers.push(userId)

  return {}
};



const removeUnpairedUser = (userId) => {
  const filteredUnpairedUsers = upChatUsers.filter((user) => user !== userId)

  upChatUsers = filteredUnpairedUsers
  console.log(upChatUsers,"func")
  return upChatUsers
};


const addupVideoUsers = (userId) => {
  const existingUser = upVideoUsers.find(user => user === userId)

  if (existingUser) {
      return { error: "User already unPaired" }
  }

  upVideoUsers.push(userId)

  return {}
};


const removeUnpairedUserVideo = (userId) => {
  console.log(userId,upVideoUsers)
  const filteredUnpairedUsers = upVideoUsers.filter((user) => user !== userId)
  upVideoUsers = filteredUnpairedUsers
  console.log(upVideoUsers,"ad")
  return upVideoUsers
};


const getUser = (userId) => allUsers.find(user => user.id === userId)

const getUsers = () => allUsers

const getUnpairedChatUsers = () => {
  return  upChatUsers
}

const getUnpairedVideoUsers = () => {
  return  upVideoUsers
}

module.exports = {
    getUser, getUsers, getUnpairedChatUsers,removeUnpairedUser,addNewUser,addupChatUsers,addupVideoUsers,removeUser,upChatUsers,removeUnpairedUserVideo,upVideoUsers,getUnpairedVideoUsers
}