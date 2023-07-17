<script lang="ts">
  import { auth } from "$lib/firebase";
	import { GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth";
  import type { PageData } from './$types';

  const provider = new GoogleAuthProvider();

  export let data: PageData;
  let user = data.user

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

  function logOut() {
    auth.signOut().then(() => {
      user = null
    }).catch((error) => {
      // An error happened.
    });
  }
</script>

{#if user}
  <p>Logged in as {user.displayName}</p>
  <button class="btn btn-secondary" on:click={logOut}>Logout</button>
{:else}
  <p>
    Not logged in
  </p>
  <button class="btn btn-primary" on:click={signIn}>Sign in with Google</button>
{/if}
