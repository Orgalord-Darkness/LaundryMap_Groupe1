import { useGoogleLogin } from "@react-oauth/google"
import GoogleButton from "../ui/GoogleButton"
import { useAuth } from "../context/AuthContext";

export default function GoogleLoginButton({ onSuccess , title, route}: { onSuccess?: () => void; title: string; route: string }) {   
  const { login } = useAuth() 
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenResponse.code })
      })
      .then(r => r.json())
      .then(data => {
        login(data.token_data)
        onSuccess && onSuccess() 
      })
    },
    flow: "auth-code"
  })

  return (
    <GoogleButton onClick={() => googleLogin()} title={title} />
  )
}
