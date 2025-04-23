const reset = document.getElementById("reset");
reset.addEventListener('click', resetMenu());

async function resetMenu() {
    try {
        const response = await fetch('/reset-menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            console.log(data.message);
        } else {
            console.error(data.error || 'Something went wrong');
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}