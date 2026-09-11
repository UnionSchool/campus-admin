import type { App } from 'vue'
import DailyAgenda from './components/DailyAgenda.vue'
import WeeklyTimetable from './components/WeeklyTimetable.vue'
import './styles.css'

export { DailyAgenda, WeeklyTimetable }

const components = [DailyAgenda, WeeklyTimetable]

export default {
  install(app: App) {
    components.forEach((component) => {
      if (component.name) app.component(component.name, component)
    })
  },
}
