<script lang="ts">
	import { onMount } from 'svelte';
	import jQuery from 'jquery';
	import Footer from '$lib/components/Footer.svelte';

	onMount(() => {
		console.log('Hi.');
	});
</script>

<div class="mainContainer">
	<header>
		<h1><span>About Sporeganizer</span></h1>
	</header>
	<Footer />
</div>
