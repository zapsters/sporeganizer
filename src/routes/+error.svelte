<script>
	import { page } from '$app/stores';
</script>

<div class="mainContainer" style="">
	<div class="mainContainer-content">
		<h1>Error {$page.status}</h1>
		<h3>{$page.error.message}</h3>
	</div>
</div>
