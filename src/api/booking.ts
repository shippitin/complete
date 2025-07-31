export async function saveBooking(data: any): Promise<void> {
  try {
    const res = await fetch('https://shippitin-backend.onrender.com/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Booking File: ${res.statusText}`);
  } catch (err) {
    console.error('Booking API error:', err);
    throw err;
  }
}