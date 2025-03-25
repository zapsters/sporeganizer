<script lang="ts">
	import { onMount } from 'svelte';
	import jQuery from 'jquery';

	// @ts-ignore
	// @ts-ignore
	import { app, db, provider } from '$lib/firebase';
	// @ts-ignore
	import * as alertManager from '$lib/alert.js';
	// @ts-ignore
	import * as firestoreDatabase from '$lib/firestoreDatabase';
	onMount(() => {
		let slideIndex = 1;
		showSlides(slideIndex);
		jQuery('.dot').on('click', function () {
			// @ts-ignore
			currentSlide(jQuery(this).attr('id')[3]);
		});

		jQuery('.prev').on('click', () => {
			plusSlides(-1);
		});
		jQuery('.next').on('click', () => {
			plusSlides(1);
		});

		// Next/previous controls
		// @ts-ignore
		function plusSlides(n) {
			showSlides((slideIndex += n));
		}

		// Thumbnail image controls
		// @ts-ignore
		function currentSlide(n) {
			showSlides((slideIndex = n));
		}

		// @ts-ignore

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
				<a href="#signin"><button>Get Started</button></a>
			</div>
		</div>
	</div>
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
			<div class="numbertext">1 / 3</div>
			<img class="raw" alt="Preview 1" src="images/previewPics/preview1.png" />
		</div>

		<div class="mySlides fade">
			<div class="numbertext">2 / 3</div>
			<img class="raw" alt="Preview 2" src="images/previewPics/preview2.png" />
			<div class="text">Caption Two</div>
		</div>

		<div class="mySlides fade">
			<div class="numbertext">3 / 3</div>
			<img class="raw" alt="Preview 3" src="images/previewPics/preview3.png" />
			<div class="text">Caption Three</div>
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
</div>
