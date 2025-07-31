// src/services/saveBooking.ts
export interface BookingData {
  name: string;
  email: string;
  from: string;
  to: string;
  cargoType: string;
  weight: number;
  price: number;
  date: string;
}

export async function saveBooking(data: BookingData): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('https://your-backend-url.com/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save booking');
    }

    return { success: true };
  } catch (error) {
    console.error('Booking error:', error);
    return { success: false, message: (error as Error).message };
  }
}