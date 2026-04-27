import type { Schedule } from '@/types'

class ScheduleService {
  async addToLocalCalendar(schedule: Schedule): Promise<boolean> {
    try {
      const icsContent = this.generateICS(schedule)
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })

      if (typeof window.navigator.share === 'function') {
        const file = new File([blob], `${schedule.eventName}.ics`, { type: 'text/calendar' })
        await navigator.share({
          files: [file],
          title: schedule.eventName
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${schedule.eventName}.ics`
        a.click()
        URL.revokeObjectURL(url)
      }

      return true
    } catch (error) {
      console.error('Failed to add to calendar:', error)
      return false
    }
  }

  async setReminder(schedule: Schedule, minutes: number = 15): Promise<void> {
    try {
      const reminderTime = new Date(schedule.eventTime.getTime() - minutes * 60 * 1000)

      if (reminderTime <= new Date()) {
        console.log('Reminder time is in the past')
        return
      }

      const { LocalNotifications } = await import('@capacitor/local-notifications')

      await LocalNotifications.schedule({
        notifications: [
          {
            title: '日程提醒',
            body: `${schedule.eventName} - 还有 ${minutes} 分钟`,
            id: parseInt(schedule.id.replace(/-/g, '').slice(0, 10), 16) % 2147483647,
            schedule: { at: reminderTime },
            actionTypeId: 'OPEN_APP'
          }
        ]
      })

      schedule.reminderMinutes = minutes
    } catch (error) {
      console.error('Failed to set reminder:', error)
    }
  }

  private generateICS(schedule: Schedule): string {
    const formatDate = (date: Date): string => {
      const pad = (n: number) => n.toString().padStart(2, '0')
      const year = date.getFullYear()
      const month = pad(date.getMonth() + 1)
      const day = pad(date.getDate())
      const hour = pad(date.getHours())
      const minute = pad(date.getMinutes())
      const second = pad(date.getSeconds())
      return `${year}${month}${day}T${hour}${minute}${second}Z`
    }

    const uid = `${schedule.id}@jieli-app`
    const now = new Date()

    let ics = 'BEGIN:VCALENDAR\n'
    ics += 'VERSION:2.0\n'
    ics += 'PRODID:-//截历//JieLi//CN\n'
    ics += 'CALSCALE:GREGORIAN\n'
    ics += 'METHOD:PUBLISH\n'
    ics += 'BEGIN:VEVENT\n'
    ics += `UID:${uid}\n`
    ics += `DTSTAMP:${formatDate(now)}\n`
    ics += `DTSTART:${formatDate(schedule.eventTime)}\n`
    ics += `DTEND:${formatDate(new Date(schedule.eventTime.getTime() + 60 * 60 * 1000))}\n`
    ics += `SUMMARY:${schedule.eventName}\n`

    if (schedule.location) {
      ics += `LOCATION:${schedule.location}\n`
    }

    if (schedule.reminderMinutes) {
      ics += 'BEGIN:VALARM\n'
      ics += 'TRIGGER:-PT' + schedule.reminderMinutes + 'M\n'
      ics += 'ACTION:DISPLAY\n'
      ics += 'DESCRIPTION:提醒\n'
      ics += 'END:VALARM\n'
    }

    ics += 'END:VEVENT\n'
    ics += 'END:VCALENDAR\n'

    return ics
  }

  async exportToCalendar(schedule: Schedule): Promise<string> {
    return this.generateICS(schedule)
  }

  async openMapApp(location: string, mapApp: string): Promise<void> {
    let url = ''
    
    switch (mapApp) {
      case 'amap':
        url = `amapuri://route/plan?dname=${encodeURIComponent(location)}&dev=0`
        break
      case 'baidumap':
        url = `baidumap://map/direction?destination=${encodeURIComponent(location)}`
        break
      case 'tencentmap':
        url = `qqmap://map/routeplan?type=drive&to=${encodeURIComponent(location)}`
        break
      default:
        url = `https://maps.apple.com/?q=${encodeURIComponent(location)}`
    }

    window.open(url, '_blank')
  }
}

export const scheduleService = new ScheduleService()
