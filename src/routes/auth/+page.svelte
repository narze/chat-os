<script lang="ts">
  import { auth } from "$lib/firebase";
	import { GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth";

  const provider = new GoogleAuthProvider();

  let user: User

  function signIn() {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential!.accessToken;
        // The signed-in user info.
        user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }
</script>

{#if user}
  <p>Logged in as {user.displayName}</p>
{:else}
  <p>
    Not logged in
    <button class="btn btn-primary" on:click={signIn}>Sign in with Google</button>
  </p>
{/if}
