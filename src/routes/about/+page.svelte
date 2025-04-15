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
	<div class="mainContainer-content padding">
		<h2 style="font-weight: 400;">
			<strong>Sporeganizer</strong>. The mushroom themed class and homework productivity app.
		</h2>
		<table>
			<tbody>
				<tr>
					<td style="padding-right: 0px;">Website Design</td>
					<td>Erin Ballinger</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
