// 🔥 Firebase Configuration (Replace with your own)
const firebaseConfig = {
  apiKey: "AIzaSyA92v6nOzdt2FresNG3BOTUtCxXulDKxis",
  authDomain: "kitchen-31e54.firebaseapp.com",
  databaseURL: "https://kitchen-31e54-default-rtdb.firebaseio.com",
  projectId: "kitchen-31e54",
  storageBucket: "kitchen-31e54.firebasestorage.app",
  messagingSenderId: "1042180962857",
  appId: "1:1042180962857:web:3a572a9453d21229ddfa38",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🌄 Unsplash API Configuration
const UNSPLASH_ACCESS_KEY = "3D-a8WU390M15Bm1-dvs3hkGfnUeCSA_xQ_YXnSy4a4";

async function getRecipe() {
    let ingredient = document.getElementById('ingredient').value.trim();
    let servings = parseInt(document.getElementById('servings').value) || 1;

    if (!ingredient) {
        alert("Please enter an ingredient, description, or command!");
        return;
    }

    let ref = db.ref('recipes/' + ingredient);
    ref.once("value", async function(snapshot) {
        if (snapshot.exists()) {
            let data = snapshot.val();
            displayRecipe(data.recipe, data.image, servings);
        } else {
            // 🔎 Fetch Recipe from ChatGPT
            let chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': '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',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [{ role: 'user', content: `Give me a recipe for ${ingredient} with ingredients and steps.` }]
                })
            });

            let chatData = await chatResponse.json();
            let recipe = chatData.choices[0].message.content;

            // 📷 Fetch Image from Unsplash
            let imageResponse = await fetch(`https://api.unsplash.com/photos/random?query=${ingredient}&client_id=${UNSPLASH_ACCESS_KEY}`);
            let imageData = await imageResponse.json();
            let imageUrl = imageData.urls.small;

            // 📂 Store Recipe & Image in Firebase
            ref.set({ recipe: recipe, image: imageUrl });

            displayRecipe(recipe, imageUrl, servings);
        }
    });
}

function displayRecipe(recipe, imageUrl, servings) {
    // Adjust serving sizes dynamically
    let adjustedRecipe = recipe.replace(/\d+(\.\d+)?/g, (match) => {
        return (parseFloat(match) * servings).toFixed(2);
    });

    document.getElementById('output').innerText = adjustedRecipe;
    document.getElementById('recipeImage').src = imageUrl;
}
