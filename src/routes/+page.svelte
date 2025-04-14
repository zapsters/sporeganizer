<script lang="ts">
	import { onMount } from 'svelte';
	import jQuery from 'jquery';
	import Footer from '$lib/components/Footer.svelte';

	onMount(() => {
		let slideIndex = 1;
		showSlides(slideIndex);
		jQuery('.dot').on('click', function () {
			currentSlide(jQuery(this).attr('id')[3]);
		});

		jQuery('.prev').on('click', () => {
			plusSlides(-1);
		});
		jQuery('.next').on('click', () => {
			plusSlides(1);
		});

		// Next/previous controls
		function plusSlides(n) {
			showSlides((slideIndex += n));
		}

		// Thumbnail image controls
		function currentSlide(n) {
			showSlides((slideIndex = n));
		}

		function showSlides(n) {
			let i;
			let slides = document.getElementsByClassName('mySlides') as HTMLCollectionOf<HTMLElement>;
			let dots = document.getElementsByClassName('dot');
			if (n > slides.length) {
				slideIndex = 1;
			}
			if (n < 1) {
				slideIndex = slides.length;
			}
			for (i = 0; i < slides.length; i++) {
				// @ts-ignore
				slides[i].style.display = 'none';
			}
			for (i = 0; i < dots.length; i++) {
				dots[i].className = dots[i].className.replace(' active', '');
			}
			// @ts-ignore
			slides[slideIndex - 1].style.display = 'block';
			dots[slideIndex - 1].className += ' active';
		}
	});
</script>

<div class="mainContainer landingPage">
	<div class="content">
		<div class="banner">
			<h1>Sporeganizer</h1>
			<h3>Where your tasks grow in order, not chaos.</h3>
		</div>
		<div class="contentAlt">
			<p>
				The lightweight homework and class tracking app that helps your tasks stay on track and
				grow! With Sporeganizer, you'll stay fung-tual and on top of your assignments. Our
				mushroom-inspired design makes managing your workload feel natural and fun, without the
				hassle.
			</p>
			<div class="inputContainer centered">
				<a href="/signin"><button>Get Started</button></a>
			</div>
		</div>
	</div>
	<h2>Stay Organized, Stay Focused</h2>
	<p>
		Tired of messy to-do lists and forgotten deadlines? <strong>Sporeganizer</strong> helps you track
		assignments, due dates, and study sessions—all in a simple, lightweight app designed for students
		who want to stay on top of their work.
	</p>
	<br />

	<h2>Why Sporeganizer?</h2>
	<ul>
		<li>
			<strong>Effortless Task Management</strong> &hyphen; Add, edit, and check off homework with ease.
		</li>
		<li>
			<strong>Stay on Top of Deadlines</strong> &hyphen; Get a clear view of what&apos;s due and when.
		</li>
		<li>
			<strong>Minimal & Fast</strong> &hyphen; No clutter, just what you need to stay productive.
		</li>
		<li>
			<strong>A Unique, Nature-Inspired Design</strong> &hyphen; A refreshing alternative to generic
			planners.
		</li>
	</ul>
	<br />

	<h2>Get Started Today</h2>
	<p>
		Sporeganizer is built to help you manage your school life without distractions. No ads, no
		unnecessary features—just a simple, effective way to stay organized.
	</p>
	<p><a href="/signin">Try Sporeganizer Now</a></p>

	<br />
	<h2>Features</h2>
	<ul>
		<li>Access your dashboard from anywhere.</li>
		<li>Flawless sync between devices.</li>
		<li>Easy connection to Google accounts.</li>
		<li>Custom classes complete with days and times.</li>
		<li>Homework and Class Management.</li>
		<li>Dark and Light Mode Themes</li>
	</ul>
	<br />
	<h2>Preview</h2>
	<!-- Slideshow container -->
	<div class="slideshow-container">
		<!-- Full-width images with number and caption text -->
		<div class="mySlides fade">
			<div class="numberText">1 / 3</div>
			<img class="raw" alt="Preview 1" src="images/previewPics/preview1.png" />
			<div class="text">Dashboard</div>
		</div>

		<div class="mySlides fade">
			<div class="numberText">2 / 3</div>
			<img class="raw" alt="Preview 2" src="images/previewPics/preview2.png" />
			<div class="text">Account</div>
		</div>

		<div class="mySlides fade">
			<div class="numberText">3 / 3</div>
			<img class="raw" alt="Preview 3" src="images/previewPics/preview3.png" />
			<div class="text">Options</div>
		</div>

		<!-- Next and previous buttons -->
		<button class="raw prev">&#10094;</button>
		<button class="raw next">&#10095;</button>
		<!-- The dots/circles -->
		<div class="dotContainer" style="text-align: center">
			<span class="dot" id="dot1"></span>
			<span class="dot" id="dot2"></span>
			<span class="dot" id="dot3"></span>
		</div>
	</div>
	<Footer />
</div>
