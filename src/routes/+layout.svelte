<script>
	import '../styles/styles.scss';
</script>

<main id="app-root">
	<aside class="sb-expanded">
		<nav>
			<ul>
				<li>
					<a href="/">
						<i><img src="./images/Sporeganizer.png" class="logo" alt="" srcset="" /></i>
						<span class="logo">Sporeganizer</span>
					</a>
				</li>
				<li id="nav-homeTab">
					<a href="/home">
						<i><img src="images/ui/home.svg" alt="dashboard" srcset="" /></i>
						<span>Home</span>
					</a>
				</li>
				<li>
					<a href="/dashboard">
						<i><img src="images/ui/dashboard.png" alt="dashboard" srcset="" /></i>
						<span>Dashboard</span>
					</a>
				</li>
				<li id="nav-signInTab">
					<a href="/signin">
						<i><img src="images/ui/person.svg" alt="login icon" srcset="" /></i>
						<span>Login</span>
					</a>
				</li>
				<li id="nav-accountTab" style="display: none">
					<a href="/account" class="wordWrap">
						<i><img src="images/ui/person.svg" alt="account icon" srcset="" /></i>
						<span class="displayName">Account</span>
					</a>
				</li>
				<!-- <li>
						<a href="/dashboard">
							<i class="pixelart-icons-font-art-text pixelArtIcon"></i>
							<span>Dashboard</span>
              </a>
							</li> -->
				<li>
					<a href="/options">
						<i><img src="images/ui/settings.svg" style="width: 100%" alt="dashboard" srcset="" /></i
						>
						<span>Options</span>
					</a>
				</li>
				<li>
					<button class="clickable sidebarToggle raw" aria-label="home">
						<i
							><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path
									fill="#ffffff"
									d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2zM10 7H8v2h2zm0 0h2V5h-2zm0 10H8v-2h2zm0 0h2v2h-2z"
								/>
							</svg>
						</i>
					</button>
				</li>
			</ul>
		</nav>
	</aside>
	<div id="app">
		<slot />
	</div>
</main>
