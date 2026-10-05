import React, { useState } from 'react';
import { ActiveDevice, DeviceType } from '../types';
import {
  IconCloudCheck,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconSync,
  IconCheck,
  IconTrash,
} from './icons';
import { setCustomDeviceName, removeDevice } from '../services/deviceService';

interface DeviceSyncStatusProps {
  devices: ActiveDevice[];
  currentDeviceId: string;
  isOnline: boolean;
  isLoggedIn: boolean;
  userEmail?: string | null;
  onRefreshSync?: () => void;
  onSignInWithGoogle?: () => void;
}

export const DeviceSyncStatus: React.FC<DeviceSyncStatusProps> = ({
  devices,
  currentDeviceId,
  isOnline,
  isLoggedIn,
  userEmail,
  onRefreshSync,
  onSignInWithGoogle,
}) => {
  const [editingName, setEditingName] = useState(false);
  const currentDevice = devices.find((d) => d.deviceId === currentDeviceId);
  const [customName, setCustomName] = useState(currentDevice?.deviceName || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveName = () => {
    if (customName.trim()) {
      setCustomDeviceName(customName.trim());
      setEditingName(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      if (onRefreshSync) onRefreshSync();
    }
  };

  const getDeviceIcon = (type: DeviceType) => {
    if (type === 'mobile' || type === 'tablet') {
      return <IconDeviceMobile size={16} className="text-[#2E5B66]" />;
    }
    return <IconDeviceLaptop size={16} className="text-[#2E5B66]" />;
  };

  const formatLastSeen = (isoString?: string) => {
    if (!isoString) return 'Active now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 30) return 'Active now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return `${Math.floor(diffSec / 3600)}h ago`;
  };

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[#C8CECB] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3E6A50] animate-pulse" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238] flex items-center gap-1.5">
              <IconCloudCheck size={16} className="text-[#3E6A50]" />
              Real-Time Cross-Device Sync
            </h3>
            <p className="text-[11px] text-[#5D676C]">
              {isLoggedIn
                ? `Connected as ${userEmail} • Tasks sync seamlessly across all screens`
                : 'Local mode active • Sign in with Google to sync across phones and laptops'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshSync && (
            <button
              onClick={onRefreshSync}
              title="Force Sync Heartbeat"
              className="p-1.5 border border-[#C8CECB] rounded text-[#5D676C] hover:bg-[#DDE1DE] flex items-center gap-1 text-xs cursor-pointer"
            >
              <IconSync size={13} />
              <span className="hidden sm:inline">Sync Now</span>
            </button>
          )}

          {!isLoggedIn && onSignInWithGoogle && (
            <button
              onClick={onSignInWithGoogle}
              className="px-3 py-1 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs font-medium rounded cursor-pointer"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </div>

      {/* Current Device Card */}
      <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#E7E9E6] border border-[#C8CECB] rounded">
            {getDeviceIcon(currentDevice?.deviceType || 'desktop')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              {editingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="text-xs bg-white border border-[#C8CECB] rounded px-2 py-0.5 text-[#253238]"
                    placeholder="e.g. Work MacBook"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 bg-[#3E6A50] text-white rounded text-xs"
                  >
                    <IconCheck size={12} />
                  </button>
                </div>
              ) : (
                <span className="text-xs font-semibold text-[#253238]">
                  {currentDevice?.deviceName || 'Current Device'}
                </span>
              )}
              <span className="text-[10px] bg-[#3E6A50]/15 text-[#3E6A50] font-semibold px-1.5 py-0.2 rounded border border-[#3E6A50]/30">
                This Device
              </span>
            </div>
            <p className="text-[11px] text-[#5D676C] font-mono mt-0.5">
              ID: {currentDeviceId.slice(0, 16)}... • Status: Synced & Live
            </p>
          </div>
        </div>

        <div>
          {!editingName && (
            <button
              onClick={() => {
                setCustomName(currentDevice?.deviceName || '');
                setEditingName(true);
              }}
              className="text-[11px] text-[#2E5B66] hover:underline"
            >
              Rename Device
            </button>
          )}
          {savedSuccess && (
            <span className="text-[11px] text-[#3E6A50] ml-2">Saved!</span>
          )}
        </div>
      </div>

      {/* Connected devices list */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#5D676C] uppercase tracking-wider">
            Active Connected Devices ({devices.length})
          </span>
          <span className="text-[11px] text-[#5D676C]">
            Firestore Realtime onSnapshot Listeners
          </span>
        </div>

        {devices.length === 0 ? (
          <p className="text-xs text-[#5D676C] italic py-2">
            No remote devices detected yet. Open this URL on your mobile browser or second computer to see instant sync.
          </p>
        ) : (
          <div className="space-y-2">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className="flex items-center justify-between bg-[#F2F3F1] border border-[#C8CECB] rounded p-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {getDeviceIcon(dev.deviceType)}
                  <div>
                    <span className="font-medium text-[#253238]">
                      {dev.deviceName}
                    </span>
                    {dev.isCurrent && (
                      <span className="text-[10px] text-[#3E6A50] ml-2 font-semibold">
                        (Active)
                      </span>
                    )}
                    <span className="text-[11px] text-[#5D676C] ml-3 tabular-nums">
                      Last seen: {formatLastSeen(dev.lastSeenAt)}
                    </span>
                  </div>
                </div>

                {!dev.isCurrent && (
                  <button
                    onClick={() => removeDevice(dev.deviceId)}
                    title="Remove device"
                    className="p-1 text-[#5D676C] hover:text-[#934444]"
                  >
                    <IconTrash size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
