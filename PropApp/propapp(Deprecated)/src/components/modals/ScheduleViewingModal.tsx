import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ScheduleViewingModalProps {
    isOpen: boolean
    onClose: () => void
    property: {
        title: string
        address: string
        image: string
    }
}

export function ScheduleViewingModal({ isOpen, onClose, property }: ScheduleViewingModalProps) {
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ]

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            setIsSuccess(true)
        }, 1500)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Schedule a Viewing</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Pick a date and time that works for you
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-400">close</span>
                        </button>
                    </div>
                </div>

                {/* Property Preview */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3 items-center">
                    <img
                        src={property.image}
                        alt={property.title}
                        className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{property.title}</h3>
                        <p className="text-xs text-slate-500">{property.address}</p>
                    </div>
                </div>

                {isSuccess ? (
                    // Success State
                    <div className="p-8 text-center">
                        <div className="size-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Viewing Scheduled!</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            You'll receive a confirmation email with the details shortly.
                        </p>
                        <Button onClick={onClose}>Done</Button>
                    </div>
                ) : (
                    // Form
                    <form onSubmit={handleSubmit} className="p-5 space-y-5">
                        {/* Date Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Select Date
                            </label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                required
                            />
                        </div>

                        {/* Time Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Select Time
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {timeSlots.map((time) => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${selectedTime === time
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-primary'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Your Name
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Phone
                                </label>
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+234..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !selectedDate || !selectedTime}
                                className="flex-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                                        Booking...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                        Confirm
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
