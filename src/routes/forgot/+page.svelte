<script>
	import { checkRequired, sendResetPasswordEmail } from '$lib/modal';
	import Jquery from 'jquery';

	async function onResetBtn() {
		try {
			var checkRequiredResponse = checkRequired('resetPassword-form');
			if (checkRequiredResponse[0]) {
				const email = Jquery('#resetPassword-email').val();
				Jquery('#resetPassword-statusText').html(await sendResetPasswordEmail(email));
			} else {
				// @ts-ignore
				Jquery('#resetPassword-statusText').html(checkRequiredResponse[1]);
			}
		} catch (error) {
			// @ts-ignore
			Jquery('#resetPassword-statusText').html(error);
		}
	}
</script>

<div class="mainContainer flex">
	<div class="signIn content">
		<h1>Forgot Password?</h1>
		<h2>No worries, we can offer some help through your email.</h2>
		<form action="" id="resetPassword-form" autocomplete="off">
			<div class="input-container">
				<input required name="email" type="text" id="resetPassword-email" autocomplete="email" />
				<label for="email">Email</label>
			</div>

			<div class="input-container">
				<input
					autocomplete="off"
					type="submit"
					id="resetPassword-submit"
					value="Send Reset Password Email"
					onclick={() => onResetBtn()}
				/>
				<br />
				<br />
				<span id="resetPassword-statusText"></span>
			</div>
		</form>
	</div>
</div>
