import { Shield, User, Smartphone, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';


export function Settings() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="h-full overflow-auto bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Settings
          </h1>

          <p className="text-white/50 mt-2">
            Manage your account, security and privacy
          </p>
        </div>

        {/* PROFILE */}
        <section className="border-b border-white/10 pb-10 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <User className="w-6 h-6 text-cyan-400" />
            <h2 className="text-3xl font-semibold">
              Profile Settings
            </h2>
          </div>

          <div className="space-y-6">

            <SettingRow
              label="Username"
              value={user?.username || ''}
              field="username"
            />

            <SettingRow
              label="Email"
              value={user?.email || ''}
              field="email"
            />

            <SettingRow
              label="Phone Number"
              value={user?.phone || ''}
              field="phone"
            />

            <SettingRow
              label="Bio"
              value={user?.bio || ''}
              field="bio"
            />

          </div>
        </section>

        {/* SECURITY */}
        <section className="border-b border-white/10 pb-10 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-3xl font-semibold">
              Password & Security
            </h2>
          </div>

          <div className="space-y-6">

            <SettingRow
              label="Password"
              value="••••••••••••"
              button="Change"
            />

            <SettingRow
              label="Two Factor Authentication"
              value="Enabled"
              button="Manage"
            />

            <SettingRow
              label="Backup Codes"
              value="12 codes remaining"
              button="View"
            />

          </div>
        </section>

        {/* DEVICES */}
        <section className="border-b border-white/10 pb-10 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <Smartphone className="w-6 h-6 text-green-400" />
            <h2 className="text-3xl font-semibold">
              Logged In Devices
            </h2>
          </div>

          <div className="space-y-4">

            <DeviceCard
              device="Chrome on Windows"
              location="Nashik, India"
              current
            />

            <DeviceCard
              device="Android App"
              location="Mumbai, India"
            />

          </div>
        </section>

        {/* ACCOUNT STANDING */}
        <section className="border-b border-white/10 pb-10 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-semibold">
              Account Standing
            </h2>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-emerald-400">
              Your account is in good standing
            </h3>

            <p className="text-white/60 mt-2">
              No warnings, bans or restrictions detected.
            </p>
          </div>
        </section>

        {/* DANGER ZONE */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-3xl font-semibold">
              Danger Zone
            </h2>
          </div>

          <div className="space-y-6">

            <DangerCard
              title="Disable Account"
              description="Temporarily disable your account"
              button="Disable"
            />

            <DangerCard
              title="Delete Account"
              description="Permanently delete your Nova account"
              button="Delete"
              danger
            />

          </div>
        </section>

      </div>
    </div>
  );
}

interface SettingRowProps {
  label: string;
  value: string;
  field?: string;
  button?: string;
  onClick?: () => void;
}

function SettingRow({
  label,
  value,
  button = "Edit",
}: SettingRowProps) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value);

  return (
    <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5">
      <div className="flex-1">
        <p className="text-sm text-white/40">
          {label}
        </p>

        {editing ? (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
          />
        ) : (
          <p className="text-lg mt-1 font-medium">
            {input}
          </p>
        )}
      </div>

      <button
        onClick={() => setEditing(!editing)}
        className="px-5 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
      >
        {editing ? "Save" : button}
      </button>
    </div>
  );
}
interface DangerCardProps {
  title: string;
  description: string;
  button: string;
  danger?: boolean;
}

function DangerCard({
  title,
  description,
  button,
  danger,
}: DangerCardProps) {
  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex items-center justify-between">
      <div>
        <h3 className="text-xl font-semibold">
          {title}
        </h3>

        <p className="text-white/50 mt-1">
          {description}
        </p>
      </div>

      <button
        className={`px-6 py-3 rounded-xl font-medium transition-all ${
          danger
            ? 'bg-red-500 hover:bg-red-600'
            : 'border border-red-500/20 hover:bg-red-500/10'
        }`}
      >
        {button}
      </button>
    </div>
  );
}
interface DeviceCardProps {
  device: string;
  location: string;
  current?: boolean;
}

function DeviceCard({
  device,
  location,
  current,
}: DeviceCardProps) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 flex items-center justify-between">
      <div>
        <p className="font-medium text-lg">
          {device}
        </p>

        <p className="text-white/50 text-sm mt-1">
          {location}
        </p>
      </div>

      {current && (
        <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
          Current Device
        </div>
      )}
    </div>
  );
}

