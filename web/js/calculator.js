function scrollToResults() {
    if (window.innerWidth <= 768) {
        const resultCard = document.querySelector('.result-card');
        const streamsNumber = document.querySelector('.streams-number');
        
        // Scroll to the result card
        resultCard.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center' // Center the card in view
        });
        
        // Add animation classes
        resultCard.classList.add('animate');
        streamsNumber.classList.add('animate');
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            resultCard.classList.remove('animate');
            streamsNumber.classList.remove('animate');
        }, 600);
    }
}

function calculateStreams(amount) {
    const perStream = 0.004;
    const streams = Math.ceil(amount / perStream);
    
    // Calculate time estimates (assuming 3 minutes per song)
    const totalMinutes = streams * 3;
    const totalHours = (totalMinutes / 60).toFixed(1);
    const totalDays = (totalHours / 24).toFixed(1);
    
    // Show the result section if hidden
    const resultSection = document.querySelector('.calculation-result');
    resultSection.style.display = 'block';
    
    // Update the UI
    const streamsRequired = document.getElementById('streamsRequired');
    const resultCard = document.querySelector('.result-card');
    
    // Remove existing animation classes
    resultCard.classList.remove('animate');
    streamsRequired.classList.remove('animate');
    
    // Force reflow
    void resultCard.offsetWidth;
    void streamsRequired.offsetWidth;
    
    // Update content
    streamsRequired.textContent = Math.ceil(streams).toLocaleString();
    document.getElementById('targetAmount').textContent = parseFloat(amount).toFixed(2);
    document.getElementById('totalMinutes').textContent = totalMinutes.toLocaleString();
    document.getElementById('totalHours').textContent = totalHours;
    document.getElementById('totalDays').textContent = totalDays;
    
    // Add animation classes
    resultCard.classList.add('animate');
    streamsRequired.classList.add('animate');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.preset-btn').forEach(button => {
        button.addEventListener('click', function() {
            const amount = parseFloat(this.dataset.amount);
            document.getElementById('customAmount').value = amount;
            calculateStreams(amount);
            document.querySelector('.calculation-result').style.display = 'block';
            scrollToResults();
        });
    });

    document.querySelector('.calculate-btn').addEventListener('click', function() {
        const amount = parseFloat(document.getElementById('customAmount').value);
        if (!isNaN(amount) && amount > 0) {
            calculateStreams(amount);
            document.querySelector('.calculation-result').style.display = 'block';
            scrollToResults();
        }
    });

    document.getElementById('customAmount').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const amount = parseFloat(e.target.value);
            if (amount > 0) {
                calculateStreams(amount);
            }
        }
    });
});

export function initCalculator() {
    const calculatorForm = document.querySelector('.custom-calculator');
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseFloat(btn.dataset.amount);
            if (!isNaN(amount)) {
                calculateStreams(amount);
            }
        });
    });
    
    // Add more initialization code
} 