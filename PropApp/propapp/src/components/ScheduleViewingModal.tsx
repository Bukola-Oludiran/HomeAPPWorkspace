import { useState } from 'react';
import ModalPortal from './ModalPortal';

interface ScheduleViewingModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: {
        name: string;
        address: string;
        image: string;
    };
}

const timeSlots = [
    { time: '9:00 AM', available: false },
    { time: '9:30 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '11:30 AM', available: true },
    { time: '1:00 PM', available: true },
    { time: '1:30 PM', available: true },
];

const agent = {
    name: 'Sarah Jenkins',
    role: 'Listing Agent',
    responseTime: '1 hr',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjSrFpmEFzY7DuSYzvGMyJ6_AbhHnvodMyset9lUUft__qqjtpv9mHHcZ_G89QxFqf2R2dKoTB_fJz4U92uCsFUL3184Bj0EySgXTcecuQVsdTPcTR-TEh34WNcFyDdaft0v9SsIZVgNjqHkcAVrUnkmB4ERkwtSLbgbP8lvDFna76LCjamOuHb71kIA10Hd2U-QwIyYE8BfDzezNODnKbjf1aE1aWwURtZm-0bYkj-A3IN-FzxBdGE2Vxyue4rROjFp2w4T6q4RmT',
};

export default function ScheduleViewingModal({ isOpen, onClose, property }: ScheduleViewingModalProps) {
    const [selectedDate, setSelectedDate] = useState(14);
    const [selectedTime, setSelectedTime] = useState('10:00 AM');
    const [formData, setFormData] = useState({
        name: 'Alex Johnson',
        phone: '(512) 555-0123',
        email: 'alex.j@example.com',
        contactMethod: 'email',
        notes: '',
    });

    // Generate calendar days for October 2023
    const generateCalendarDays = () => {
        const days = [];
        // Empty cells for days before the 1st (Tuesday = 2 empty cells)
        for (let i = 0; i < 2; i++) {
            days.push({ day: 0, disabled: true });
        }
        // Days 1-5 are past
        for (let i = 1; i <= 5; i++) {
            days.push({ day: i, disabled: true });
        }
        // Days 6-19 are available
        for (let i = 6; i <= 19; i++) {
            days.push({ day: i, disabled: false, hasSlots: i === 15 });
        }
        return days;
    };

    const calendarDays = generateCalendarDays();
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

                {/* Modal */}
                <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-canvas-dark rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-canvas-dark sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Schedule a viewing</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                {property.address}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-500 dark:text-slate-400"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full">
                            {/* Left Column - Calendar & Time */}
                            <div className="lg:col-span-7 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-canvas-dark">
                                {/* Agent Info */}
                                <div className="flex items-center gap-4 mb-8 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <div className="relative">
                                        <img
                                            alt={agent.name}
                                            className="size-12 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                                            src={agent.image}
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 p-0.5">
                                            <span className="material-symbols-outlined text-white text-xs font-bold block">check</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{agent.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{agent.role} • Usually responds in {agent.responseTime}</p>
                                    </div>
                                    <div className="ml-auto text-xs font-medium px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                                        High availability
                                    </div>
                                </div>

                                {/* Step 1: Select Date */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span className="size-6 rounded-full bg-brand/10 text-brand-ink flex items-center justify-center text-xs font-bold">1</span>
                                            Select date
                                        </h3>
                                        <div className="flex gap-1">
                                            <button className="size-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                            </button>
                                            <span className="text-sm font-semibold py-1.5">October 2023</span>
                                            <button className="size-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                            {weekDays.map((day) => (
                                                <span key={day} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{day}</span>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-2">
                                            {calendarDays.map((item, index) => (
                                                item.day === 0 ? (
                                                    <div key={index} className="h-10"></div>
                                                ) : item.disabled ? (
                                                    <button
                                                        key={index}
                                                        className="h-10 rounded-lg text-sm text-slate-300 dark:text-slate-600 line-through cursor-not-allowed"
                                                        disabled
                                                    >
                                                        {item.day}
                                                    </button>
                                                ) : (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedDate(item.day)}
                                                        className={`h-10 rounded-lg text-sm font-medium relative transition-colors ${selectedDate === item.day
                                                            ? 'bg-brand-ink text-on-brand'
                                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        {item.day}
                                                        {item.hasSlots && (
                                                            <span className="absolute top-1 right-1 size-1.5 bg-green-500 rounded-full"></span>
                                                        )}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2: Select Time */}
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="size-6 rounded-full bg-brand/10 text-brand-ink flex items-center justify-center text-xs font-bold">2</span>
                                        Select Time <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">(Sat, Oct {selectedDate})</span>
                                    </h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => slot.available && setSelectedTime(slot.time)}
                                                disabled={!slot.available}
                                                className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${!slot.available
                                                    ? 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50'
                                                    : selectedTime === slot.time
                                                        ? 'bg-brand/10 border-brand text-brand-ink font-bold shadow-sm ring-1 ring-brand/20'
                                                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand hover:text-brand-ink bg-white dark:bg-slate-800'
                                                    }`}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Contact Details */}
                            <div className="lg:col-span-5 p-6 md:p-8 flex flex-col h-full bg-white dark:bg-canvas-dark">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="size-6 rounded-full bg-brand/10 text-brand-ink flex items-center justify-center text-xs font-bold">3</span>
                                    Your details
                                </h3>
                                <form className="space-y-4 flex-1">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Full name</label>
                                        <input
                                            className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-brand focus:ring-brand/20 text-sm py-2.5"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Phone</label>
                                            <input
                                                className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-brand focus:ring-brand/20 text-sm py-2.5"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Email</label>
                                            <input
                                                className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-brand focus:ring-brand/20 text-sm py-2.5"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 mt-4 uppercase tracking-wide">Preferred contact method</label>
                                        <div className="flex gap-4">
                                            {['email', 'phone', 'sms'].map((method) => (
                                                <label key={method} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="radio"
                                                        name="contact"
                                                        className="text-brand-ink focus:ring-brand border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                                                        checked={formData.contactMethod === method}
                                                        onChange={() => setFormData({ ...formData, contactMethod: method })}
                                                    />
                                                    <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-brand-ink transition-colors capitalize">
                                                        {method === 'sms' ? 'Text (SMS)' : method === 'phone' ? 'Phone Call' : 'Email'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 mt-4 uppercase tracking-wide">Notes (Optional)</label>
                                        <textarea
                                            className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:border-brand focus:ring-brand/20 text-sm p-3 resize-none"
                                            placeholder="Any specific questions or requests?"
                                            rows={2}
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>
                                </form>

                                {/* Booking Summary */}
                                <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Booking summary</h4>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <span className="material-symbols-outlined text-brand-ink">calendar_month</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">Sat, Oct {selectedDate}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTime} - {selectedTime.includes('30') ? `${parseInt(selectedTime) + 1}:00 ${selectedTime.includes('AM') ? 'AM' : 'PM'}` : `${selectedTime.replace(':00', ':30')}`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <span className="material-symbols-outlined text-brand-ink">home</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">In-Person Viewing</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{property.address.split(',')[0]}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="flex-[2] py-3.5 rounded-xl bg-brand-ink text-on-brand font-bold hover:bg-[#0e64bd] transition-colors flex items-center justify-center gap-2"
                                    >
                                        Confirm booking
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </button>
                                </div>
                                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                                    By confirming, you agree to our Terms of Service.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating AI Tip */}
                <div className="fixed bottom-[30px] left-0 right-0 flex justify-center z-[210] px-4 pointer-events-none">
                    <div className="w-full max-w-2xl bg-white/95 dark:bg-canvas-dark/95 backdrop-blur-xl border border-brand/20 shadow-lg rounded-full py-2 px-2 flex items-center gap-3 pointer-events-auto transition-all hover:scale-[1.01]" style={{ boxShadow: '0 0 15px rgba(19, 127, 236, 0.4)' }}>
                        <div className="size-10 rounded-full bg-brand flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white">forum</span>
                        </div>
                        <div className="flex-1 overflow-hidden h-10 flex items-center">
                            <p className="text-slate-600 dark:text-slate-300 text-sm truncate">
                                <span className="font-bold text-brand-ink mr-1">AI Tip:</span> {agent.name} usually accepts weekend viewings. I can also find similar homes nearby.
                            </p>
                        </div>
                        <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">mic</span>
                        </button>
                        <button className="size-10 rounded-full bg-brand hover:bg-[#0e64bd] flex items-center justify-center transition-colors shrink-0 shadow-sm">
                            <span className="material-symbols-outlined text-white">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
