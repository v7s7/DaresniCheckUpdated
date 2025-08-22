import { useState } from "react";
import { Button } from "@/components/ui/button";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [];

// Generate time slots from 6 AM to 10 PM
for (let hour = 6; hour <= 22; hour++) {
  const time12 = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
  TIME_SLOTS.push({
    hour24: hour,
    display: time12,
    minutes: hour * 60
  });
}

export default function AvailabilityGrid({ 
  availability = [], 
  onAvailabilityChange, 
  readOnly = false,
  selectedSlots = [] 
}) {
  const [localAvailability, setLocalAvailability] = useState(availability);

  const isSlotAvailable = (day, timeSlot) => {
    return localAvailability.some(slot => 
      slot.weekday === DAYS.indexOf(day) && 
      slot.startMinutes <= timeSlot.minutes && 
      slot.endMinutes > timeSlot.minutes
    );
  };

  const isSlotSelected = (day, timeSlot) => {
    return selectedSlots.some(slot =>
      slot.day === day && slot.time === timeSlot.display
    );
  };

  const toggleSlot = (day, timeSlot) => {
    if (readOnly) return;

    const dayIndex = DAYS.indexOf(day);
    const slotMinutes = timeSlot.minutes;
    
    // Find existing slot for this day and time
    const existingSlotIndex = localAvailability.findIndex(slot =>
      slot.weekday === dayIndex &&
      slot.startMinutes <= slotMinutes &&
      slot.endMinutes > slotMinutes
    );

    let newAvailability;
    if (existingSlotIndex >= 0) {
      // Remove the slot
      newAvailability = localAvailability.filter((_, index) => index !== existingSlotIndex);
    } else {
      // Add new 1-hour slot
      newAvailability = [...localAvailability, {
        weekday: dayIndex,
        startMinutes: slotMinutes,
        endMinutes: slotMinutes + 60
      }];
    }

    setLocalAvailability(newAvailability);
    onAvailabilityChange?.(newAvailability);
  };

  const handleSlotClick = (day, timeSlot) => {
    if (readOnly && !isSlotAvailable(day, timeSlot)) return;
    
    if (readOnly) {
      // In read-only mode, this is for booking selection
      const slot = { day, time: timeSlot.display, minutes: timeSlot.minutes };
      // This would be handled by parent component
      console.log('Selected slot:', slot);
    } else {
      toggleSlot(day, timeSlot);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border" data-testid="availability-grid">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          {readOnly ? 'Available Times' : 'Set Your Availability'}
        </h3>
        {!readOnly && (
          <p className="text-sm text-gray-600 mt-1">
            Click on time slots to toggle your availability
          </p>
        )}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-8 gap-2 text-sm">
          {/* Header */}
          <div className="font-medium text-gray-700"></div>
          {DAYS.map(day => (
            <div key={day} className="font-medium text-gray-700 text-center p-2">
              {day.substring(0, 3)}
            </div>
          ))}

          {/* Time slots */}
          {TIME_SLOTS.map(timeSlot => (
            <div key={timeSlot.hour24} className="contents">
              <div className="font-medium text-gray-600 p-2 text-right">
                {timeSlot.display}
              </div>
              {DAYS.map(day => {
                const available = isSlotAvailable(day, timeSlot);
                const selected = isSlotSelected(day, timeSlot);
                const clickable = !readOnly || available;
                
                return (
                  <button
                    key={`${day}-${timeSlot.hour24}`}
                    onClick={() => handleSlotClick(day, timeSlot)}
                    disabled={!clickable}
                    className={`
                      h-8 rounded text-xs font-medium transition-colors
                      ${available 
                        ? selected
                          ? 'bg-blue-500 text-white'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                        : readOnly
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 cursor-pointer'
                      }
                    `}
                    data-testid={`slot-${day}-${timeSlot.hour24}`}
                  >
                    {available ? (readOnly ? 'Available' : '✓') : ''}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {!readOnly && (
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-50 rounded mr-2"></div>
                <span className="text-gray-600">Unavailable</span>
              </div>
            </div>
            <Button
              onClick={() => {
                // Clear all availability
                setLocalAvailability([]);
                onAvailabilityChange?.([]);
              }}
              variant="outline"
              size="sm"
              data-testid="button-clear-availability"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
