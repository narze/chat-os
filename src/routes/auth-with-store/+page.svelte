<script lang="ts">
	import { userStore } from '$lib/firebase-store';

	const user = userStore();
</script>

{#if $user === undefined}
	<p>Loading...</p>
{:else if $user}
	<p>Logged in as {$user.displayName}</p>
{:else}
	<p>Not logged in</p>
{/if}
