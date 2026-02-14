import { useDispatch, useSelector } from 'react-redux';
import { updateSettings } from '../features/settings/settingsSlice';
import { logout } from '../features/auth/authSlice';

export default function SettingsPage() {
    const dispatch = useDispatch();
    const settings = useSelector(state => state.settings);

    const handleChange = (key, value) => {
        dispatch(updateSettings({ [key]: value }));
    };

    return (
        <div className="p-4 space-y-6 pb-20">
            <h2 className="text-2xl font-bold text-green-800">Settings</h2>

            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Harian (Juz)</label>
                    <select 
                        value={settings.targetChunks}
                        onChange={(e) => handleChange('targetChunks', parseInt(e.target.value))}
                        className="w-full bg-green-50 border-none rounded-lg p-3 text-lg font-bold text-green-800 outline-none"
                    >
                        <option value="0.5">Setengah Juz</option>
                        <option value="1">1 Juz</option>
                        <option value="2">2 Juz</option>
                        <option value="5">5 Juz</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notifikasi (Reminder)</label>
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                         <span className="font-medium">Aktifkan Notifikasi</span>
                         <input 
                            type="checkbox" 
                            checked={settings.notificationsEnabled}
                            onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
                            className="w-5 h-5 accent-green-600"
                        />
                    </div>
                     {settings.notificationsEnabled && (
                        <input 
                            type="time" 
                            value={settings.notificationTime}
                            onChange={(e) => handleChange('notificationTime', e.target.value)}
                            className="w-full mt-2 p-3 rounded-lg border border-green-200"
                        />
                    )}
                </div>
            </div>

            <button 
                onClick={() => dispatch(logout())}
                className="w-full py-4 text-red-600 font-bold bg-white rounded-xl shadow-sm hover:bg-red-50 transition"
            >
                Keluar Apliaksi
            </button>
        </div>
    );
}
