const journalElement = document.querySelector("#journal");
let entryList = [];
const decoder = new TextDecoder('UTF-8');

const getEntries = async () => {
    const response = await fetch('Foutput6.txt');
    const data = await response.arrayBuffer();
    let text = decoder.decode(data);
    entryList = text.split("$%$");
    // Once entries are retrieved, display them with the fetched images
    displayEntries(entryList);
};

let CLIENT_ID = '801661531180-hf85oea8673sp9tqjbpfc5b5f51hcaq8.apps.googleusercontent.com';
let accessToken = '';  // This will store the access token after authentication

const displayEntries = (entryList) => {
    entryList.forEach(entryArray => {
        let entry = parseCSVLine(entryArray);
        let imgArray = entry[4].split(',');

        let ar = document.createElement('article');
        ar.setAttribute('class','pagebreak');
        let h2 = document.createElement('h2');
        let h3 = document.createElement('h3');
        let p = document.createElement('p');
        let imgcontain = document.createElement('div');

        let getImgs = async () => {
            for (let img of imgArray) {
                let thisimg = document.createElement('img');
                let fileId = img.split("=")[1];
                let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

                try {
                    const response = await fetch(url, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}` // Use the obtained access token
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch image: ${response.statusText}`);
                    }
                    
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);
                    thisimg.setAttribute('src', imageUrl);
                    imgcontain.appendChild(thisimg);
                } catch (error) {
                    console.error(`Error fetching image ${fileId}:`, error);
                }
            }
        };

        // Fetch images after creating the element
        getImgs();

        h2.innerHTML = entry[0];
        h3.innerHTML = `${entry[1]} - ${entry[2]}`;
        p.innerHTML = entry[3];

        ar.appendChild(h2);
        ar.appendChild(h3);
        ar.appendChild(p);
        ar.appendChild(imgcontain);
        journalElement.appendChild(ar);
    });
};

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

function initializeGIS() {
    google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (response) => {
            accessToken = response.access_token;  // Store the access token for use in fetching images
            getEntries();  // Start fetching entries after authentication
        }
    }).requestAccessToken();
}

// Initialize GIS on window load
window.onload = initializeGIS;