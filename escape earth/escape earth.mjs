import fetch from 'node-fetch';

const PLAYER_EMAIL = 'aasmundh@uia.no';
const BASE_URL = 'https://spacescavanger.onrender.com';
const SPACE_API = 'https://api.le-systeme-solaire.net/rest/bodies/';

async function startMission() {
    try {
        const response = await fetch(`${BASE_URL}/start?player=${PLAYER_EMAIL}`);
        const data = await response.json();
        console.log('Mission Started:', data);
        return data;
    } catch (error) {
        console.error('Error starting mission:', error);
    }
}

async function getSpaceData() {
    try {
        const response = await fetch(`${SPACE_API}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched Space Data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching space data:', error);
    }
}

async function submitAnswer(answer) {
    try {
        const response = await fetch(`${BASE_URL}/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answer, player: PLAYER_EMAIL })
        });
        const data = await response.json();
        console.log('Answer Submitted:', data);
    } catch (error) {
        console.error('Error submitting answer:', error);
    }
}

(async () => {
    const missionData = await startMission();
    const spaceData = await getSpaceData();
    
    if (spaceData && spaceData.bodies) {
        const earthData = spaceData.bodies.find(body => body.englishName === 'Earth');
        if (!earthData) {
            console.error('Earth data not found');
            return;
        }
        const earthAxialTilt = earthData.axialTilt;
        console.log('Earth Axial Tilt:', earthAxialTilt);

        let closestPlanet = null;
        let smallestDifference = Infinity;

        spaceData.bodies.forEach(body => {
            if (body.axialTilt !== undefined && body.isPlanet && body.englishName !== 'Earth') {
                const difference = Math.abs(body.axialTilt - earthAxialTilt);
                console.log(`Checking planet: ${body.englishName}, Axial Tilt: ${body.axialTilt}, Difference: ${difference}`);
                if (difference < smallestDifference) {
                    smallestDifference = difference;
                    closestPlanet = body;
                }
            }
        });

        if (closestPlanet) {
            console.log('Closest Planet:', closestPlanet.englishName, 'with axial tilt:', closestPlanet.axialTilt);
            await submitAnswer(closestPlanet.englishName);
        } else {
            console.error('No planet with similar axial tilt found');
        }
    } else {
        console.error('Invalid space data');
    }
})();
