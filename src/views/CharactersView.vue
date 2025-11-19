<template>
	<div class="page">
		<header class="page__header">
			<h1 class="page__title">
				<i class="pi pi-users"/>
				<span>Персонажи «Рик и Морти»</span>
			</h1>
		</header>

		<section class="toolbar">
			<!-- Поиск по имени -->
			<span class="p-input-icon-left toolbar__item toolbar__item--wide">
				<InputText
					v-model="name"
					class="toolbar__input"
					placeholder="Поиск по имени, например, Rick"
					type="text"
					@keyup.enter="applyFilters"
				/>
			</span>

			<!-- Статус -->
			<div class="toolbar__item">
				<Select
					v-model="status"
					:options="statusOptions"
					optionLabel="label"
					optionValue="value"
					class="toolbar__select"
					fluid
					@update:modelValue="applyFilters"
				/>
			</div>

			<!-- Локация -->
			<div class="toolbar__item">
				<Select
					v-model="selectedLocation"
					:options="locationOptions"
					optionLabel="label"
					optionValue="value"
					class="toolbar__select"
					placeholder="Локация"
					fluid
				/>
			</div>

			<!-- Сортировка -->
			<div class="toolbar__item">
				<Select
					v-model="sortKey"
					:options="sortOptions"
					optionLabel="label"
					optionValue="value"
					class="toolbar__select"
					placeholder="Сортировка"
					fluid
				/>
			</div>

			<!-- Кнопка поиска -->
			<div class="toolbar__item toolbar__item--button">
				<Button
					class="toolbar__button"
					type="button"
					label="Найти"
					icon="pi pi-filter"
					@click="applyFilters"
				/>
			</div>
		</section>

		<section v-if="isLoading" class="state">
			<i class="pi pi-spinner pi-spin"/>
			<span>Загружаем персонажей...</span>
		</section>

		<section v-else-if="error" class="state state--error">
			<i class="pi pi-exclamation-triangle"/>
			<span>{{ error }}</span>
		</section>

		<section v-else class="content">
			<div v-if="visibleCharacters.length === 0" class="state">
				<i class="pi pi-info-circle"/>
				<span>Ничего не найдено</span>
			</div>

			<div v-else class="character-list-wrapper">
				<div class="character-list">
					<CharacterCard
						v-for="character in visibleCharacters"
						:key="character.id"
						:character="character"
					/>
				</div>
			</div>

			<div class="pagination">
				<Button
					class="pagination-button"
					:disabled="page === 1 || isLoading"
					icon="pi pi-arrow-left"
					label="Назад"
					@click="prevPage"
				/>

				<span class="pagination-info">Страница {{ page }}</span>

				<Button
					class="pagination-button"
					:disabled="!hasNextPage || isLoading"
					icon="pi pi-arrow-right"
					iconPos="right"
					label="Вперёд"
					@click="nextPage"
				/>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import axios from 'axios'

import CharacterCard from '../components/CharacterCard.vue'

import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'

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

interface ApiInfo {
	next: string | null
}

interface ApiResponse {
	info: ApiInfo
	results: Character[]
}

type SortKey = 'name-asc' | 'name-desc' | 'episodes-asc' | 'episodes-desc'
type StatusFilter = 'any' | 'alive' | 'dead' | 'unknown'

interface Option<T> {
	label: string
	value: T
}

// текущий список персонажей
const characters = ref<Character[]>([])
// номер страницы API
const page = ref(1)
// есть ли следующая страница
const hasNextPage = ref(true)
// индикатор загрузки
const isLoading = ref(false)
// текст ошибки
const error = ref<string | null>(null)

// строка поиска по имени
const name = ref('')
// выбранный статус
const status = ref<StatusFilter>('any')
// выбранная локация
const selectedLocation = ref<'all' | string>('all')
// выбранный тип сортировки
const sortKey = ref<SortKey>('name-asc')

// опции селекта статуса
const statusOptions: Option<StatusFilter>[] = [
	{label: 'Любой статус', value: 'any'},
	{label: 'Жив', value: 'alive'},
	{label: 'Мёртв', value: 'dead'},
	{label: 'Неизвестно', value: 'unknown'}
]

// опции селекта сортировки
const sortOptions: Option<SortKey>[] = [
	{label: 'Имя: A → Z', value: 'name-asc'},
	{label: 'Имя: Z → A', value: 'name-desc'},
	{label: 'Больше эпизодов', value: 'episodes-desc'},
	{label: 'Меньше эпизодов', value: 'episodes-asc'}
]

// опции селекта локаций
const locationOptions = computed<Option<'all' | string>[]>(() => {
	const set = new Set<string>()
	for (const c of characters.value) {
		if (c.location?.name) {
			set.add(c.location.name)
		}
	}

	const options: Option<'all' | string>[] = [
		{label: 'Все локации', value: 'all'}
	]

	for (const loc of Array.from(set).sort((a, b) => a.localeCompare(b))) {
		options.push({label: loc, value: loc})
	}

	return options
})

// персонажи с учётом сортировки и фильтрации по локации
const visibleCharacters = computed<Character[]>(() => {
	if (!characters.value.length) return []

	let list = [...characters.value]

	if (selectedLocation.value !== 'all') {
		list = list.filter((c) => c.location?.name === selectedLocation.value)
	}

	list.sort((a, b) => {
		switch (sortKey.value) {
			case 'name-asc':
				return a.name.localeCompare(b.name)
			case 'name-desc':
				return b.name.localeCompare(a.name)
			case 'episodes-asc':
				return a.episode.length - b.episode.length
			case 'episodes-desc':
				return b.episode.length - a.episode.length
			default:
				return 0
		}
	})

	return list
})

// базовый URL API
const API_URL = 'https://rickandmortyapi.com/api/character'

// загрузка персонажей с сервера
const fetchCharacters = async () => {
	isLoading.value = true
	error.value = null

	try {
		const response = await axios.get<ApiResponse>(API_URL, {
			params: {
				page: page.value,
				name: name.value || undefined,
				status: status.value === 'any' ? undefined : status.value
			}
		})

		characters.value = response.data.results
		hasNextPage.value = response.data.info.next !== null
	} catch (e: any) {
		if (e?.response?.status === 404) {
			characters.value = []
			hasNextPage.value = false
			error.value = 'Персонажей с такими фильтрами не найдено'
		} else {
			error.value = 'Ошибка загрузки персонажей'
			console.error('Error fetching characters:', e)
		}
	} finally {
		isLoading.value = false
	}
}

// применить поиск и фильтры
const applyFilters = () => {
	page.value = 1
	selectedLocation.value = 'all'
	fetchCharacters()
}

// перейти на следующую страницу
const nextPage = () => {
	if (!hasNextPage.value || isLoading.value) return
	page.value += 1
	fetchCharacters()
}

// перейти на предыдущую страницу
const prevPage = () => {
	if (page.value <= 1 || isLoading.value) return
	page.value -= 1
	fetchCharacters()
}

// первичная загрузка при монтировании
onMounted(fetchCharacters)
</script>

<style scoped>
.page {
	max-width: 1200px;
	margin: 0 auto;
	padding: 24px 16px 40px;
	color: #e5e7eb;
}

.page__header {
	margin-bottom: 20px;
}

.page__title {
	margin-bottom: 6px;
	font-size: clamp(22px, 3vw, 28px);
	font-weight: 700;
	display: flex;
	gap: 10px;
	align-items: center;
}

.page__title .pi {
	font-size: 22px;
	color: #22c55e;
}

.toolbar {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	margin-bottom: 20px;
	padding: 16px;
	border-radius: 16px;
	background: radial-gradient(circle at top left, #0b1726, #020617);
	border: 1px solid rgba(148, 163, 184, 0.4);
	box-shadow: 0 20px 40px rgba(15, 23, 42, 0.8);
}

.toolbar__item {
	flex: 1 1 160px;
	min-width: 0;
}

.toolbar__item--wide {
	flex-basis: 100%;
}

.toolbar__item--button {
	flex: 0 0 auto;
}

@media (max-width: 640px) {
	.toolbar__item--button {
		flex-basis: 100%;
	}
}

.toolbar__input,
.toolbar__select {
	width: 100%;
}

.toolbar__button :deep(.p-button) {
	width: 100%;
}

.state {
	margin-top: 16px;
	padding: 24px 16px;
	text-align: center;
	color: #e5e7eb;
	display: flex;
	gap: 10px;
	justify-content: center;
	align-items: center;
	border-radius: 16px;
	background: rgba(15, 23, 42, 0.9);
	border: 1px solid rgba(75, 85, 99, 0.6);
}

.state--error {
	color: #fecaca;
	border-color: rgba(248, 113, 113, 0.7);
}

.state .pi {
	font-size: 18px;
}

.content {
	margin-top: 8px;
}

.character-list-wrapper {
	margin-top: 12px;
	border-radius: 20px;
	background: radial-gradient(circle at top, #1f2937, #020617);
	padding: 20px 14px;
	box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
}

.character-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: stretch;
	gap: 16px;
}

.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 18px 0 0;
	gap: 10px;
}

.pagination-info {
	font-size: 0.95rem;
	color: #e5e7eb;
}

.pagination-button :deep(.p-button) {
	border-radius: 999px;
	padding-inline: 18px;
}

@media (max-width: 768px) {
	.page {
		padding: 16px 12px 28px;
	}

	.character-list-wrapper {
		padding: 16px 10px;
	}

	.state {
		padding-inline: 12px;
	}
}
</style>
