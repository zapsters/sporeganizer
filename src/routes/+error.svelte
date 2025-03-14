<script>
	import { page } from '$app/stores';
</script>

<div
	class="mainContainer"
	style="
display: flex;
align-items: center;
justify-content: center;
flex-direction: column;
"
>
	<h1>Error {$page.status}</h1>
	<h3>{$page.error.message}</h3>
</div>
