export const initialStore = () => {
  return {
    user: JSON.parse(sessionStorage.getItem("user")) || null,
    token: sessionStorage.getItem("token") || null,
    isPro: JSON.parse(sessionStorage.getItem("user"))?.plan === "pro" || false,
    plants: [],
    currentPlant: null,
    communityPosts: [],
    diagnosis: null,
    loading: false,
    message: null,
  }
}

export default function storeReducer(store, action = {}) {
  switch (action.type) {

    case "login":
      sessionStorage.setItem("token", action.payload.token)
      sessionStorage.setItem("user", JSON.stringify(action.payload.user))
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
        isPro: action.payload.user.plan === "pro",
      }

    case "logout":
      sessionStorage.removeItem("token")
      sessionStorage.removeItem("user")
      return {
        ...store,
        token: null,
        user: null,
        isPro: false,
        plants: [],
        currentPlant: null,
        communityPosts: [],
        diagnosis: null,
      }

    case "update_user":
      const updatedUser = { ...store.user, ...action.payload }
      sessionStorage.setItem("user", JSON.stringify(updatedUser))
      return {
        ...store,
        user: updatedUser,
        isPro: updatedUser.plan === "pro",
      }

    case "upgrade_plan":
      const proUser = { ...store.user, plan: "pro" }
      sessionStorage.setItem("user", JSON.stringify(proUser))
      return {
        ...store,
        user: proUser,
        isPro: true,
      }

    case "set_plants":
      return { ...store, plants: action.payload }

    case "add_plant":
      return { ...store, plants: [action.payload, ...store.plants] }

    case "update_plant":
      return {
        ...store,
        plants: store.plants.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      }

    case "delete_plant":
      return {
        ...store,
        plants: store.plants.filter(p => p.id !== action.payload),
      }

    case "set_current_plant":
      return { ...store, currentPlant: action.payload }

    case "set_diagnosis":
      return { ...store, diagnosis: action.payload }

    case "set_community_posts":
      return { ...store, communityPosts: action.payload }

    case "add_community_post":
      return { ...store, communityPosts: [action.payload, ...store.communityPosts] }

    case "like_post":
      return {
        ...store,
        communityPosts: store.communityPosts.map(p =>
          p.id === action.payload ? { ...p, likes_count: p.likes_count + 1 } : p
        ),
      }

    case "set_loading":
      return { ...store, loading: action.payload }

    case "set_message":
      return { ...store, message: action.payload }

    default:
      throw Error("Unknown action: " + action.type)
  }
}