function chatBot() {
    return {
        prompts: [
            // Tomato-specific prompts
            ["why are my tomato leaves curling", "tomato leaf curl"],
            ["what causes spots on tomato leaves", "brown spots on tomato leaves"],
            ["why are my tomato leaves turning yellow", "yellow tomato leaves"],
            ["how do I treat tomato blight", "what is tomato blight"],
            ["how do I prevent blossom end rot in tomatoes", "tomato blossom end rot"],
            ["why are my tomatoes splitting", "tomato fruit splitting"],
            ["how to get rid of aphids on tomato plants", "aphids on tomatoes"],
            ["how to treat spider mites on tomatoes", "spider mites on tomato plants"],
            ["how to prevent whiteflies on tomatoes", "whiteflies on tomato plants"],
            ["what is early blight", "how to identify late blight", "what causes powdery mildew", "what is root rot"],
            ["what is calcium deficiency in tomatoes", "how do I fix magnesium deficiency", "how to recognize nutrient deficiencies"],

            // Additional prompts for gaining knowledge about tomatoes
            ["how to grow tomatoes", "best practices for growing tomatoes"],
            ["when to plant tomatoes", "tomato planting schedule"],
            ["how much water do tomatoes need", "tomato watering requirements"],
            ["what is the best fertilizer for tomatoes", "how to fertilize tomatoes"],
            ["how to prune tomato plants", "pruning techniques for tomatoes"],
            ["what are common tomato pests", "how to identify tomato pests"],
            ["how to control tomato diseases", "preventing diseases in tomatoes"],
            ["what are signs of tomato disease", "how to recognize tomato disease symptoms"],
            ["how to protect tomatoes from frost", "frost protection for tomatoes"],
            ["what is companion planting for tomatoes", "best companions for tomatoes"],
            ["how to store harvested tomatoes", "preserving tomatoes after harvest"],
            ["what are heirloom tomatoes", "difference between heirloom and hybrid tomatoes"],
            ["how to grow tomatoes in containers", "container gardening for tomatoes"]
        ],

        replies: [
            // Tomato-related replies
            ["Tomato leaf curl can be caused by heat stress or pests like aphids. Try using an insecticidal soap if pests are present."],
            ["Brown spots on tomato leaves might be a sign of fungal infections like Septoria or early blight. Try using a fungicide."],
            ["Yellowing leaves could be due to nutrient deficiency or over-watering. Make sure your tomatoes have well-drained soil."],
            ["Tomato blight is a fungal disease that can be managed with fungicides and crop rotation."],
            ["Blossom end rot in tomatoes is often due to calcium deficiency. Ensure consistent watering and add calcium if needed."],
            ["Tomato splitting happens due to uneven watering. Water tomatoes consistently and avoid sudden heavy watering."],
            ["Aphids can be removed with insecticidal soap or by introducing beneficial insects like ladybugs."],
            ["Spider mites thrive in hot, dry conditions. Spray the plant with water or use neem oil to reduce infestations."],
            ["Whiteflies can be controlled by using yellow sticky traps or spraying with insecticidal soap."],
            ["Early blight is characterized by dark spots on leaves, while late blight can cause rapid wilting and death of plants."],
            ["Powdery mildew appears as a white, powdery coating on leaves. It's best treated with fungicides and good air circulation."],
            ["Root rot is often caused by overwatering; ensure good drainage and reduce watering frequency."],
            ["Calcium deficiency leads to blossom end rot; adding lime or gypsum can help."],
            ["Magnesium deficiency shows up as yellowing between leaf veins; Epsom salt can be a quick fix."],

            // Additional replies for gaining knowledge about tomatoes
            ["To grow tomatoes successfully, choose a sunny spot, use quality seeds or seedlings, and ensure good soil preparation."],
            ["The best time to plant tomatoes is after the last frost date, typically in late spring."],
            ["Tomatoes generally need about 1-2 inches of water per week. Make sure the soil stays consistently moist but not soggy."],
            ["A balanced fertilizer with equal parts nitrogen, phosphorus, and potassium works well for tomatoes."],
            ["Pruning involves removing suckers and lower leaves to improve air circulation and focus energy on fruit production."],
            ["Common tomato pests include aphids, spider mites, and whiteflies. Check for signs of infestations regularly."],
            ["Controlling tomato diseases involves crop rotation, proper spacing, and timely application of fungicides."],
            ["Signs of tomato disease may include yellowing leaves, wilting, or unusual spots. Inspect your plants regularly."],
            ["To protect tomatoes from frost, cover them with cloths or plastic at night during cold snaps."],
            ["Companion planting with basil, marigolds, or garlic can help repel pests and enhance growth."],
            ["Store harvested tomatoes in a cool, dry place. Avoid refrigeration as it can alter their flavor."],
            ["Heirloom tomatoes are open-pollinated varieties known for their unique flavors and colors, unlike hybrids."],
            ["Growing tomatoes in containers requires a large pot (at least 5 gallons) with good drainage and quality potting mix."]
        ],

        alternative: [
            "I'm listening...", 
            "Could you clarify that?", 
            "I didn't catch that, can you say it differently?", 
            "Interesting! Tell me more."
        ],
        
        botTyping: false,
        
        messages: [{
            from: 'bot',
            text: 'Hello! How can I help you with your plants today?'
        }],
        
        output: function(input) {
            let product;

            // Normalize input text
            let text = input.toLowerCase().replace(/[^\w\s]/gi, "").replace(/[\d]/gi, "").trim();
            text = text
                .replace(/ a /g, " ")
                .replace(/i feel /g, "")
                .replace(/whats/g, "what is")
                .replace(/please /g, "")
                .replace(/ please/g, "")
                .replace(/r u/g, "are you");

            // Check for matching prompt or similar prompt
            product = this.compare(this.prompts, this.replies, text);

            // Provide a default response if no match is found
            if (!product) {
                if (text.match(/thank/gi)) {
                    product = "You're welcome!";
                } else {
                    product = this.alternative[Math.floor(Math.random() * this.alternative.length)];
                }
            }

            this.addChat(input, product);
        },
        
        compare: function(promptsArray, repliesArray, string) {
            let reply;
            let replyFound = false;

            // Exact match
            for (let x = 0; x < promptsArray.length; x++) {
                for (let y = 0; y < promptsArray[x].length; y++) {
                    if (promptsArray[x][y] === string) {
                        reply = repliesArray[x][0]; // Get the first response
                        replyFound = true;
                        break;
                    }
                }
                if (replyFound) {
                    break;
                }
            }

            // Fuzzy match
            if (!replyFound) {
                for (let x = 0; x < promptsArray.length; x++) {
                    for (let y = 0; y < promptsArray[x].length; y++) {
                        if (this.levenshtein(promptsArray[x][y], string) >= 0.75) {
                            reply = repliesArray[x][0]; // Get the first response
                            replyFound = true;
                            break;
                        }
                    }
                    if (replyFound) {
                        break;
                    }
                }
            }
            return reply;
        },
        
        levenshtein: function(s1, s2) {
            let longer = s1;
            let shorter = s2;
            if (s1.length < s2.length) {
                longer = s2;
                shorter = s1;
            }
            const longerLength = longer.length;
            if (longerLength === 0) {
                return 1.0;
            }
            return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
        },
        
        editDistance: function(s1, s2) {
            s1 = s1.toLowerCase();
            s2 = s2.toLowerCase();

            const costs = new Array();
            for (let i = 0; i <= s1.length; i++) {
                let lastValue = i;
                for (let j = 0; j <= s2.length; j++) {
                    if (i === 0) {
                        costs[j] = j;
                    } else {
                        if (j > 0) {
                            const newValue = costs[j - 1];
                            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                                lastValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                            }
                            costs[j - 1] = lastValue;
                            lastValue = newValue;
                        }
                    }
                }
                if (i > 0) {
                    costs[s2.length] = lastValue;
                }
            }
            return costs[s2.length];
        },
        
        addChat: function(input, product) {
            this.messages.push({
                from: 'user',
                text: input
            });

            this.scrollChat();

            setTimeout(() => {
                this.botTyping = true;
                this.scrollChat();
            }, 1000)

            setTimeout(() => {
                this.botTyping = false;
                this.messages.push({
                    from: 'bot',
                    text: product
                });
                this.scrollChat();
            }, ((product.length / 10) * 1000) + (Math.floor(Math.random() * 2000) + 1500));
        },

        scrollChat: function() {
            const messagesContainer = document.getElementById("messages");
            messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
            }, 100);
        },

        updateChat: function(target) {
            if (target.value.trim()) {
                this.output(target.value.trim());
                target.value = '';
            }
        }
    }
}



