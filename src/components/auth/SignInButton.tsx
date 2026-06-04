import { GoogleLogin } from '@react-oauth/google';
import { decodeGoogleJwt } from '../../lib/jwt';
import { useAuthStore } from '../../stores/authStore';

export function SignInButton() {
  const signIn = useAuthStore((s) => s.signIn);

  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        const token = credentialResponse.credential;
        if (!token) return;
        const payload = decodeGoogleJwt(token);
        signIn(token, {
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        });
      }}
      onError={() => {
        console.error('Google sign-in failed');
      }}
      theme="filled_black"
      size="medium"
      shape="rectangular"
    />
  );
}
