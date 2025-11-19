<template>
	<Card class="characterCard">
		<template #content>
			<div class="characterCard__inner">
				<div class="characterCard__imgWrapper">
					<div
						v-if="!isImageLoaded"
						class="characterCard__imgSkeleton"
					></div>

					<img
						:alt="props.character.name"
						:src="props.character.image"
						@load="handleImageLoad"
						:class="['characterCard__img',{ 'characterCard__img--visible': isImageLoaded }]"
					/>
				</div>

				<div class="characterCard__content">
					<header class="characterCard__header">
						<h2 class="characterCard__name">
							{{ props.character.name }}
						</h2>

						<div class="characterCard__statusRow">
							<Tag
								:value="statusText"
								:severity="statusSeverity"
								rounded
								icon="pi pi-heart-fill"
							/>
							<span class="characterCard__species">
                {{ props.character.species }}
              </span>
						</div>
					</header>

					<dl class="characterCard__meta">
						<div class="meta-row">
							<dt>
								<i class="pi pi-home"/>
								<span>Родом из</span>
							</dt>
							<dd>{{ props.character.origin.name }}</dd>
						</div>

						<div class="meta-row">
							<dt>
								<i class="pi pi-map-marker"/>
								<span>Последняя локация</span>
							</dt>
							<dd>{{ props.character.location.name }}</dd>
						</div>

						<div class="meta-row">
							<dt>
								<i class="pi pi-video"/>
								<span>Кол-во эпизодов</span>
							</dt>
							<dd>{{ props.character.episode.length }}</dd>
						</div>
					</dl>
				</div>
			</div>
		</template>
	</Card>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'

interface CharacterOrigin {
	name: string
}

interface CharacterLocation {
	name: string
}

interface Character {
	id: number
	name: string
	status: 'Alive' | 'Dead' | 'unknown'
	species: string
	origin: CharacterOrigin
	location: CharacterLocation
	image: string
	episode: string[]
}

const props = defineProps<{
	character: Character
}>()

const isImageLoaded = ref(false)

// обработчик onload для img
const handleImageLoad = () => {
	isImageLoaded.value = true
}

const statusText = computed(() => {
	switch (props.character.status) {
		case 'Alive':
			return 'Жив'
		case 'Dead':
			return 'Мёртв'
		default:
			return 'Неизвестно'
	}
})

const statusSeverity = computed<'success' | 'danger' | 'info'>(() => {
	switch (props.character.status) {
		case 'Alive':
			return 'success'
		case 'Dead':
			return 'danger'
		default:
			return 'info'
	}
})
</script>

<style scoped>
.characterCard {
	border-radius: 18px;
	overflow: hidden;
	background: radial-gradient(circle at top left, #111827, #020617);
	border: 1px solid rgba(148, 163, 184, 0.5);
	transition: transform 0.18s ease-out,
	box-shadow 0.18s ease-out,
	border-color 0.18s ease-out;
}

.characterCard:hover {
	transform: translateY(-3px);
	box-shadow: 0 18px 45px rgba(15, 23, 42, 0.9);
	border-color: rgba(56, 189, 248, 0.7);
}

.characterCard__inner {
	display: flex;
	flex-direction: column;
	min-height: 210px;
}

.characterCard__imgWrapper {
	position: relative;
	width: 260px;
	height: 260px;
	overflow: hidden;
	background: #020617;
}

.characterCard__img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center center;
	display: block;
	transform: scale(1.02);
	opacity: 0;
	transition: transform 0.25s ease-out,
	opacity 0.25s ease-out;
}

.characterCard__img--visible {
	opacity: 1;
}

.characterCard:hover .characterCard__img {
	transform: scale(1.06);
}

.characterCard__imgSkeleton {
	position: absolute;
	inset: 0;
	background: linear-gradient(
		90deg,
		#020617 0%,
		#111827 50%,
		#020617 100%
	);
	background-size: 200% 100%;
	animation: characterCard-skeleton 1.1s ease-in-out infinite;
}

@keyframes characterCard-skeleton {
	0% {
		background-position: 0% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

.characterCard__content {
	flex: 1 1 60%;
	padding: 12px 14px 12px 14px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	color: #e5e7eb;
}

.characterCard__header {
	display: flex;
	flex-direction: column;
	gap: 6px;
	align-items: center;
}

.characterCard__name {
	font-size: 18px;
	font-weight: 700;
	margin: 0;
}

.characterCard__statusRow {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	align-items: center;
}

.characterCard__species {
	font-size: 0.9rem;
	opacity: 0.85;
}

.characterCard__meta {
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 6px;
	font-size: 0.9rem;
	align-items: center;
}

.meta-row {
	display: flex;
	flex-direction: column;
	gap: 2px;
	align-items: center;
}

.meta-row dt {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: 0.8rem;
	color: #9ca3af;
	text-transform: uppercase;
	letter-spacing: 0.03em;
}

.meta-row dt .pi {
	font-size: 0.8rem;
}

.meta-row dd {
	margin: 0;
	font-weight: 500;
}

@media (max-width: 768px) {
	.characterCard__inner {
		flex-direction: column;
	}

	.characterCard__imgWrapper {
		width: 100%;
		height: 210px;
	}

	.characterCard__content {
		padding: 10px 12px 12px;
	}

	.characterCard__name {
		font-size: 16px;
	}
}
</style>