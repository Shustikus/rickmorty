import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
// Компоненты страниц
import CharactersView from './views/CharactersView.vue'

// Создание роутера с правильной базой
const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'Home',
		component: CharactersView
	}
]

const router = createRouter({
	history: createWebHistory('/rickmorty/'),
	routes
})

export default router