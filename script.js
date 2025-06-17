// DOM Elements
const referenceStringInput = document.getElementById('referenceString');
const frameCountInput = document.getElementById('frameCount');
const randomizeBtn = document.getElementById('randomizeBtn');
const startBtn = document.getElementById('startBtn');
const compareBtn = document.getElementById('compareBtn');
const clearBtn = document.getElementById('clearBtn');
const prevStepBtn = document.getElementById('prevStepBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const playBtn = document.getElementById('playBtn');
const simulationSpeedInput = document.getElementById('simulationSpeed');
const currentPageElem = document.getElementById('currentPage');
const currentStepElem = document.getElementById('currentStep');
const totalStepsElem = document.getElementById('totalSteps');
const stepResultElem = document.getElementById('stepResult');
const memoryFramesElem = document.getElementById('memoryFrames');
const referenceStringVisualElem = document.getElementById('referenceStringVisual');
const pageFaultsElem = document.getElementById('pageFaults');
const pageHitsElem = document.getElementById('pageHits');
const faultRatioElem = document.getElementById('faultRatio');
const hitRatioElem = document.getElementById('hitRatio');
const comparisonContainerElem = document.getElementById('comparisonContainer');
const comparisonResultsElem = document.getElementById('comparisonResults');
const comparisonChartElem = document.getElementById('comparisonChart');

// Export functionality
const exportPDFBtn = document.getElementById('exportPDFBtn');
const exportCSVBtn = document.getElementById('exportCSVBtn');

// Theory Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Simulation state
let referenceString = [];
let frameCount = 3;
let currentAlgorithm = 'fifo';
let currentStep = 0;
let simulationSteps = [];
let playInterval = null;
let comparisonResults = {};
let chart = null;

// Theory Tabs
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button and corresponding pane
        button.classList.add('active');
        const paneId = button.getAttribute('data-tab');
        document.getElementById(paneId).classList.add('active');
    });
});

// Event Listeners
window.addEventListener('DOMContentLoaded', initialize);
randomizeBtn.addEventListener('click', generateRandomReferenceString);
startBtn.addEventListener('click', startSimulation);
compareBtn.addEventListener('click', compareAlgorithms);
clearBtn.addEventListener('click', resetSimulation);
prevStepBtn.addEventListener('click', goToPreviousStep);
nextStepBtn.addEventListener('click', goToNextStep);
playBtn.addEventListener('click', togglePlaySimulation);

// Event listeners for export buttons
exportPDFBtn.addEventListener('click', exportPDF);
exportCSVBtn.addEventListener('click', exportCSV);

// Initialize the application
function initialize() {
    console.log('Initializing application...');
    referenceStringInput.value = '7, 0, 1, 2, 0, 3, 0, 4';
    frameCountInput.value = '3';
    
    // Set up event listeners for algorithm selection
    document.querySelectorAll('input[name="algorithm"]').forEach(radio => {
        radio.addEventListener('change', function() {
            currentAlgorithm = this.value;
            if (simulationSteps.length > 0) {
                startSimulation();
            }
        });
    });
}

// Generate a random reference string
function generateRandomReferenceString() {
    const length = 10 + Math.floor(Math.random() * 10); // 10-20 pages
    const maxPageNumber = 9; // 0-9 page numbers
    let randomString = [];
    
    for (let i = 0; i < length; i++) {
        randomString.push(Math.floor(Math.random() * (maxPageNumber + 1)));
    }
    
    referenceStringInput.value = randomString.join(', ');
}

// Parse the reference string from input
function parseReferenceString() {
    const input = referenceStringInput.value.trim();
    if (!input) return [];
    
    return input.split(',')
        .map(num => num.trim())
        .filter(num => !isNaN(parseInt(num)))
        .map(num => parseInt(num));
}

// Start the simulation with the selected algorithm
function startSimulation() {
    // Parse input values
    referenceString = parseReferenceString();
    frameCount = parseInt(frameCountInput.value);
    
    // Validate inputs
    if (referenceString.length === 0) {
        alert('Please enter a valid reference string.');
        return;
    }
    
    if (isNaN(frameCount) || frameCount < 1 || frameCount > 10) {
        alert('Please enter a valid number of frames (1-10).');
        return;
    }
    
    // Hide comparison container if it was visible
    comparisonContainerElem.style.display = 'none';
    
    // Run the selected algorithm
    switch (currentAlgorithm) {
        case 'fifo':
            simulationSteps = simulateFIFO(referenceString, frameCount);
            break;
        case 'lru':
            simulationSteps = simulateLRU(referenceString, frameCount);
            break;
        case 'optimal':
            simulationSteps = simulateOptimal(referenceString, frameCount);
            break;
        case 'lfu':
            simulationSteps = simulateLFU(referenceString, frameCount);
            break;
        case 'clock':
            simulationSteps = simulateClock(referenceString, frameCount);
            break;
    }
    
    // Reset to the first step and update UI
    currentStep = 0;
    updateUI();
    
    // Enable simulation controls
    prevStepBtn.disabled = true;
    nextStepBtn.disabled = false;
    playBtn.disabled = false;
    
    // Update play button icon to play
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

// FIFO Page Replacement Algorithm
function simulateFIFO(referenceString, frameCount) {
    const frames = Array(frameCount).fill(null);
    let fifoQueue = [];
    let pageFaults = 0;
    let steps = [];
    
    // Create initial step
    steps.push({
        page: null,
        frames: [...frames],
        fifoQueue: [...fifoQueue],
        result: 'Initial state',
        isHit: false,
        isFault: false,
        pageFaults,
        pageHits: 0
    });
    
    // Process each page in the reference string
    referenceString.forEach((page, index) => {
        const pageIndex = frames.indexOf(page);
        let isHit = pageIndex !== -1;
        let replacedPage = null;
        
        if (!isHit) {
            // Page fault - need to replace a page
            pageFaults++;
            
            // If there's an empty frame, use it
            const emptyIndex = frames.indexOf(null);
            if (emptyIndex !== -1) {
                frames[emptyIndex] = page;
                fifoQueue.push(emptyIndex); // Add to queue
            } else {
                // Replace the oldest page (FIFO)
                const replaceIndex = fifoQueue.shift(); // Get the oldest frame index
                replacedPage = frames[replaceIndex];
                frames[replaceIndex] = page;
                fifoQueue.push(replaceIndex); // Add to queue
            }
        }
        
        // Create a step for this page reference
        steps.push({
            page,
            frames: [...frames],
            fifoQueue: [...fifoQueue],
            result: isHit ? 'Page Hit' : 'Page Fault',
            isHit,
            isFault: !isHit,
            replacedPage,
            pageFaults,
            pageHits: index + 1 - pageFaults
        });
    });
    
    return steps;
}

// LRU (Least Recently Used) Page Replacement Algorithm
function simulateLRU(referenceString, frameCount) {
    const frames = Array(frameCount).fill(null);
    let lruOrder = []; // Keeps track of order of use (most recently used at the end)
    let pageFaults = 0;
    let steps = [];
    
    // Create initial step
    steps.push({
        page: null,
        frames: [...frames],
        lruOrder: [...lruOrder],
        result: 'Initial state',
        isHit: false,
        isFault: false,
        pageFaults,
        pageHits: 0
    });
    
    // Process each page in the reference string
    referenceString.forEach((page, index) => {
        const pageIndex = frames.indexOf(page);
        let isHit = pageIndex !== -1;
        let replacedPage = null;
        
        // Update LRU order - remove if exists, then add to end (most recently used)
        const lruIndex = lruOrder.indexOf(pageIndex);
        if (lruIndex !== -1) {
            lruOrder.splice(lruIndex, 1);
        }
        
        if (!isHit) {
            // Page fault - need to replace a page
            pageFaults++;
            
            // If there's an empty frame, use it
            const emptyIndex = frames.indexOf(null);
            if (emptyIndex !== -1) {
                frames[emptyIndex] = page;
                lruOrder.push(emptyIndex); // Add to LRU order
            } else {
                // Replace the least recently used page
                const replaceIndex = lruOrder.shift(); // Get the least recently used frame index
                replacedPage = frames[replaceIndex];
                frames[replaceIndex] = page;
                lruOrder.push(replaceIndex); // Add to LRU order
            }
        } else {
            // Page hit - update LRU order
            lruOrder.push(pageIndex);
        }
        
        // Create a step for this page reference
        steps.push({
            page,
            frames: [...frames],
            lruOrder: [...lruOrder],
            result: isHit ? 'Page Hit' : 'Page Fault',
            isHit,
            isFault: !isHit,
            replacedPage,
            pageFaults,
            pageHits: index + 1 - pageFaults
        });
    });
    
    return steps;
}

// Optimal Page Replacement Algorithm
function simulateOptimal(referenceString, frameCount) {
    const frames = Array(frameCount).fill(null);
    let pageFaults = 0;
    let steps = [];
    
    // Create initial step
    steps.push({
        page: null,
        frames: [...frames],
        result: 'Initial state',
        isHit: false,
        isFault: false,
        pageFaults,
        pageHits: 0
    });
    
    // Process each page in the reference string
    referenceString.forEach((page, index) => {
        const pageIndex = frames.indexOf(page);
        let isHit = pageIndex !== -1;
        let replacedPage = null;
        
        if (!isHit) {
            // Page fault - need to replace a page
            pageFaults++;
            
            // If there's an empty frame, use it
            const emptyIndex = frames.indexOf(null);
            if (emptyIndex !== -1) {
                frames[emptyIndex] = page;
            } else {
                // Replace the page that won't be used for the longest time in the future
                let farthestIndex = -1;
                let farthestDistance = -1;
                
                // Check each frame to find the one that won't be used for the longest time
                for (let i = 0; i < frames.length; i++) {
                    const currentPage = frames[i];
                    let nextUseDistance = referenceString.slice(index + 1).indexOf(currentPage);
                    
                    // If the page won't be used again, it's the best candidate for replacement
                    if (nextUseDistance === -1) {
                        farthestIndex = i;
                        break;
                    }
                    
                    // Otherwise, find the page that will be used farthest in the future
                    if (nextUseDistance > farthestDistance) {
                        farthestDistance = nextUseDistance;
                        farthestIndex = i;
                    }
                }
                
                // Replace the selected page
                replacedPage = frames[farthestIndex];
                frames[farthestIndex] = page;
            }
        }
        
        // Create a step for this page reference
        steps.push({
            page,
            frames: [...frames],
            result: isHit ? 'Page Hit' : 'Page Fault',
            isHit,
            isFault: !isHit,
            replacedPage,
            pageFaults,
            pageHits: index + 1 - pageFaults
        });
    });
    
    return steps;
}

// LFU (Least Frequently Used) Page Replacement Algorithm
function simulateLFU(referenceString, frameCount) {
    const frames = Array(frameCount).fill(null);
    let pageFrequencies = new Map(); // Tracks frequency of each page
    let pageTimestamps = new Map(); // Tracks when each page was last accessed
    let pageFaults = 0;
    let steps = [];
    let currentTime = 0;
    
    // Create initial step
    steps.push({
        page: null,
        frames: [...frames],
        frequencies: new Map(pageFrequencies),
        result: 'Initial state',
        isHit: false,
        isFault: false,
        pageFaults,
        pageHits: 0
    });
    
    // Process each page in the reference string
    referenceString.forEach((page, index) => {
        currentTime++;
        const pageIndex = frames.indexOf(page);
        let isHit = pageIndex !== -1;
        let replacedPage = null;
        
        // Update frequency and timestamp for the current page
        pageFrequencies.set(page, (pageFrequencies.get(page) || 0) + 1);
        pageTimestamps.set(page, currentTime);
        
        if (!isHit) {
            // Page fault - need to replace a page
            pageFaults++;
            
            // If there's an empty frame, use it
            const emptyIndex = frames.indexOf(null);
            if (emptyIndex !== -1) {
                frames[emptyIndex] = page;
            } else {
                // Find the least frequently used page
                let minFreq = Infinity;
                let lfuPages = [];
                
                // Find pages with minimum frequency
                frames.forEach((framePage, idx) => {
                    const freq = pageFrequencies.get(framePage) || 0;
                    if (freq < minFreq) {
                        minFreq = freq;
                        lfuPages = [idx];
                    } else if (freq === minFreq) {
                        lfuPages.push(idx);
                    }
                });
                
                // If multiple pages have the same minimum frequency,
                // use FIFO among them (the one that was loaded first)
                let replaceIndex = lfuPages[0];
                if (lfuPages.length > 1) {
                    let oldestTime = Infinity;
                    lfuPages.forEach(idx => {
                        const page = frames[idx];
                        const timestamp = pageTimestamps.get(page);
                        if (timestamp < oldestTime) {
                            oldestTime = timestamp;
                            replaceIndex = idx;
                        }
                    });
                }
                
                replacedPage = frames[replaceIndex];
                frames[replaceIndex] = page;
            }
        }
        
        // Create a step for this page reference
        steps.push({
            page,
            frames: [...frames],
            frequencies: new Map(pageFrequencies),
            result: isHit ? 'Page Hit' : 'Page Fault',
            isHit,
            isFault: !isHit,
            replacedPage,
            pageFaults,
            pageHits: index + 1 - pageFaults
        });
    });
    
    return steps;
}

// Second Chance (Clock) Algorithm implementation
function simulateClock(referenceString, frameCount) {
    let frames = new Array(frameCount).fill(null);
    let referenceBits = new Array(frameCount).fill(false);
    let pointer = 0;
    let steps = [];
    let pageFaults = 0;
    let pageHits = 0;

    // Create initial step
    steps.push({
        page: null,
        frames: [...frames],
        referenceBits: [...referenceBits],
        pointer: pointer,
        result: 'Initial state',
        isHit: false,
        isFault: false,
        pageFaults: 0,
        pageHits: 0
    });

    for (let i = 0; i < referenceString.length; i++) {
        const page = referenceString[i];
        const step = {
            page: page,
            frames: [...frames],
            referenceBits: [...referenceBits],
            pointer: pointer,
            result: '',
            isHit: false,
            isFault: false,
            pageFaults: pageFaults,
            pageHits: pageHits
        };

        // Check if page is in frames
        const pageIndex = frames.indexOf(page);
        if (pageIndex !== -1) {
            // Page hit
            referenceBits[pageIndex] = true;
            step.isHit = true;
            step.result = 'Page Hit';
            pageHits++;
        } else {
            // Page fault
            step.isFault = true;
            step.result = 'Page Fault';
            pageFaults++;

            // Find a frame to replace
            while (true) {
                if (frames[pointer] === null) {
                    // Empty frame found
                    frames[pointer] = page;
                    referenceBits[pointer] = true;
                    pointer = (pointer + 1) % frameCount;
                    break;
                } else if (referenceBits[pointer]) {
                    // Give second chance
                    referenceBits[pointer] = false;
                    pointer = (pointer + 1) % frameCount;
                } else {
                    // Replace this frame
                    frames[pointer] = page;
                    referenceBits[pointer] = true;
                    pointer = (pointer + 1) % frameCount;
                    break;
                }
            }
        }

        step.frames = [...frames];
        step.referenceBits = [...referenceBits];
        step.pointer = pointer;
        step.pageFaults = pageFaults;
        step.pageHits = pageHits;
        steps.push(step);
    }

    return steps;
}

// Update the UI with the current step
function updateUI() {
    if (simulationSteps.length === 0) return;
    
    const step = simulationSteps[currentStep];
    
    // Update step information
    currentPageElem.textContent = step.page !== null ? step.page : '-';
    currentStepElem.textContent = currentStep;
    totalStepsElem.textContent = simulationSteps.length - 1;
    stepResultElem.textContent = step.result;
    
    // Update memory frames visualization
    updateMemoryFramesVisualization(step);
    
    // Update reference string visualization
    updateReferenceStringVisualization();
    
    // Update statistics
    const totalReferences = simulationSteps.length - 1;
    const pageFaults = step.pageFaults;
    const pageHits = step.pageHits;
    const faultRatio = ((pageFaults / totalReferences) * 100).toFixed(1);
    const hitRatio = ((pageHits / totalReferences) * 100).toFixed(1);
    
    pageFaultsElem.textContent = pageFaults;
    pageHitsElem.textContent = pageHits;
    faultRatioElem.textContent = `${faultRatio}%`;
    hitRatioElem.textContent = `${hitRatio}%`;
    
    // Update timeline visualization
    if (window.timelineViz) {
        const pageFaultsData = simulationSteps.map(step => step.pageFaults);
        const memoryUsageData = simulationSteps.map(step => 
            step.frames.filter(frame => frame !== null).length
        );
        const pageHitsData = simulationSteps.map(step => step.pageHits);
        
        window.timelineViz.updateTimeline(
            simulationSteps.length,
            pageFaultsData,
            memoryUsageData,
            pageHitsData
        );
        window.timelineViz.setCurrentStep(currentStep);
    }
    
    // Update button states
    prevStepBtn.disabled = currentStep === 0;
    nextStepBtn.disabled = currentStep === simulationSteps.length - 1;
}

// Update the memory frames visualization
function updateMemoryFramesVisualization(step) {
    memoryFramesElem.innerHTML = '';
    
    // Create frame elements
    for (let i = 0; i < frameCount; i++) {
        const frame = document.createElement('div');
        frame.className = 'memory-frame';
        
        // Create 3D frame container
        const frame3D = document.createElement('div');
        frame3D.className = 'frame-3d';
        
        // Create frame faces
        const faces = ['front', 'back', 'top', 'bottom', 'left', 'right'];
        faces.forEach(face => {
            const faceElement = document.createElement('div');
            faceElement.className = `frame-face frame-${face}`;
            
            // Add frame number with more descriptive text
            const frameNumber = document.createElement('div');
            frameNumber.className = 'frame-number';
            frameNumber.textContent = `Memory Frame ${i + 1}`;
            frameNumber.title = `This is Memory Frame ${i + 1} of ${frameCount} frames`;
            faceElement.appendChild(frameNumber);
            
            // Add page content
            const pageContent = document.createElement('div');
            pageContent.className = 'page-content';
            if (step.frames[i] !== null) {
                pageContent.textContent = step.frames[i];
                pageContent.title = `Page ${step.frames[i]} is stored in this frame`;
                
                // Add reference bit indicator for Clock algorithm
                if (currentAlgorithm === 'clock' && step.referenceBits) {
                    const referenceBit = document.createElement('div');
                    referenceBit.className = 'reference-bit';
                    referenceBit.textContent = step.referenceBits[i] ? '1' : '0';
                    referenceBit.title = `Reference Bit: ${step.referenceBits[i] ? '1 (Recently Used)' : '0 (Not Recently Used)'}`;
                    pageContent.appendChild(referenceBit);
                }
            } else {
                pageContent.textContent = 'Empty';
                pageContent.title = 'This frame is currently empty';
            }
            faceElement.appendChild(pageContent);
            
            frame3D.appendChild(faceElement);
        });
        
        frame.appendChild(frame3D);
        
        // Add pointer indicator for Clock algorithm
        if (currentAlgorithm === 'clock' && step.pointer === i) {
            const pointer = document.createElement('div');
            pointer.className = 'clock-pointer';
            pointer.textContent = '↑';
            pointer.title = 'Clock Pointer: This frame will be checked next for replacement';
            frame.appendChild(pointer);
        }
        
        // Add highlight if this is the current page
        if (step.page === step.frames[i]) {
            frame.classList.add('current-page');
            frame.title = `Current Page ${step.page} is in this frame`;
        }
        
        memoryFramesElem.appendChild(frame);
    }
}

// Update the reference string visualization
function updateReferenceStringVisualization() {
    referenceStringVisualElem.innerHTML = '';
    
    referenceString.forEach((page, index) => {
        const refElement = document.createElement('div');
        refElement.className = 'reference-item';
        refElement.textContent = page;
        
        // Mark current, past, hit, or fault
        if (index < currentStep - 1) {
            refElement.classList.add('past');
            
            const stepForThisPage = simulationSteps[index + 1];
            if (stepForThisPage.isHit) {
                refElement.classList.add('hit');
            } else {
                refElement.classList.add('fault');
            }
        } else if (index === currentStep - 1) {
            refElement.classList.add('current');
            
            const stepForThisPage = simulationSteps[currentStep];
            if (stepForThisPage.isHit) {
                refElement.classList.add('hit');
            } else {
                refElement.classList.add('fault');
            }
        }
        
        referenceStringVisualElem.appendChild(refElement);
    });
}

// Go to the previous step in the simulation
function goToPreviousStep() {
    if (currentStep > 0) {
        currentStep--;
        updateUI();
    }
}

// Go to the next step in the simulation
function goToNextStep() {
    if (currentStep < simulationSteps.length - 1) {
        currentStep++;
        updateUI();
    }
}

// Toggle play/pause of the simulation
function togglePlaySimulation() {
    if (playInterval) {
        // Pause the simulation
        clearInterval(playInterval);
        playInterval = null;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        // Play the simulation
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        // Reset to beginning if at the end
        if (currentStep === simulationSteps.length - 1) {
            currentStep = 0;
        }
        
        const speed = 1100 - (simulationSpeedInput.value * 100); // Convert 1-10 to 1000-100ms
        
        playInterval = setInterval(() => {
            if (currentStep < simulationSteps.length - 1) {
                currentStep++;
                updateUI();
            } else {
                // End of simulation, stop playing
                clearInterval(playInterval);
                playInterval = null;
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        }, speed);
    }
}

// Compare all algorithms
function compareAlgorithms() {
    // Parse input values
    referenceString = parseReferenceString();
    frameCount = parseInt(frameCountInput.value);
    
    // Validate inputs
    if (referenceString.length === 0) {
        alert('Please enter a valid reference string.');
        return;
    }
    
    if (isNaN(frameCount) || frameCount < 1 || frameCount > 10) {
        alert('Please enter a valid number of frames (1-10).');
        return;
    }
    
    // Run all algorithms
    comparisonResults = {
        fifo: simulateFIFO(referenceString, frameCount),
        lru: simulateLRU(referenceString, frameCount),
        optimal: simulateOptimal(referenceString, frameCount),
        lfu: simulateLFU(referenceString, frameCount),
        clock: simulateClock(referenceString, frameCount)
    };
    
    // Show comparison container
    comparisonContainerElem.style.display = 'block';
    
    // Update comparison UI
    updateComparisonUI();
    
    // Create comparison chart
    createComparisonChart();
}

// Update the comparison UI
function updateComparisonUI() {
    comparisonResultsElem.innerHTML = '';
    
    // Create result cards for each algorithm
    const algorithms = [
        { key: 'fifo', name: 'FIFO (First In First Out)', color: '#3b82f6' },
        { key: 'lru', name: 'LRU (Least Recently Used)', color: '#10b981' },
        { key: 'optimal', name: 'Optimal', color: '#f59e0b' },
        { key: 'lfu', name: 'LFU (Least Frequently Used)', color: '#8b5cf6' },
        { key: 'clock', name: 'Clock', color: '#ef4444' }
    ];
    
    // Create a container for the comparison table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'comparison-table-container';
    
    // Create the comparison table
    const table = document.createElement('table');
    table.className = 'comparison-table';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Algorithm</th>
            <th>Page Faults</th>
            <th>Page Hits</th>
            <th>Fault Ratio</th>
            <th>Hit Ratio</th>
            <th>Efficiency</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    algorithms.forEach(algorithm => {
        const steps = comparisonResults[algorithm.key];
        if (!steps || steps.length === 0) return;
        
        const finalStep = steps[steps.length - 1];
        const totalPages = steps.length - 1;
        
        const pageFaults = finalStep.pageFaults;
        const pageHits = finalStep.pageHits;

        // Avoid division by zero if no pages processed (unlikely but safe)
        const faultRatio = totalPages === 0 ? 'N/A' : ((pageFaults / totalPages) * 100).toFixed(1);
        const hitRatio = totalPages === 0 ? 'N/A' : ((pageHits / totalPages) * 100).toFixed(1);
        
        // Calculate efficiency relative to Optimal algorithm
        const optimalSteps = comparisonResults.optimal;
        const optimalFinalStep = optimalSteps ? optimalSteps[optimalSteps.length - 1] : null;
        const optimalFaults = optimalFinalStep ? optimalFinalStep.pageFaults : null;

        let efficiency = 'N/A';
        if (optimalFaults !== null && pageFaults > 0) {
            efficiency = ((optimalFaults / pageFaults) * 100).toFixed(1);
        } else if (optimalFaults === 0 && pageFaults === 0) {
            efficiency = 100;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="color: ${algorithm.color}">${algorithm.name}</td>
            <td>${pageFaults}</td>
            <td>${pageHits}</td>
            <td>${faultRatio}%</td>
            <td>${hitRatio}%</td>
            <td>${efficiency}${efficiency !== 'N/A' ? '%' : ''}</td>
        `;
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    comparisonResultsElem.appendChild(tableContainer);
    
    // Create comparison chart (will be called after this function finishes)
    // createComparisonChart(); // Removed as it's called directly after updateComparisonUI in compareAlgorithms
}

// Create a chart to compare algorithms
function createComparisonChart() {
    if (chart) {
        chart.destroy();
    }
    
    const ctx = comparisonChartElem.getContext('2d');
    
    const algorithms = [
        { key: 'fifo', name: 'FIFO', color: '#3b82f6' },
        { key: 'lru', name: 'LRU', color: '#10b981' },
        { key: 'optimal', name: 'Optimal', color: '#f59e0b' },
        { key: 'lfu', name: 'LFU', color: '#8b5cf6' },
        { key: 'clock', name: 'Clock', color: '#ef4444' }
    ];
    
    const labels = algorithms.map(alg => alg.name);
    const colors = algorithms.map(alg => alg.color);
    
    const pageFaultsData = [];
    const pageHitsData = [];
    const efficiencyData = [];
    let optimalFaults = null;

    // First, find optimal faults to calculate efficiency
    const optimalSteps = comparisonResults.optimal;
    if (optimalSteps && optimalSteps.length > 0) {
        optimalFaults = optimalSteps[optimalSteps.length - 1].pageFaults;
    }

    algorithms.forEach(algorithm => {
        const steps = comparisonResults[algorithm.key];
        if (steps && steps.length > 0) {
            const finalStep = steps[steps.length - 1];
            const faults = finalStep.pageFaults;
            const hits = finalStep.pageHits;
            const totalPages = steps.length - 1; // Number of page references

            pageFaultsData.push(faults);
            pageHitsData.push(hits);

            let efficiency = null; // Use null for Chart.js to handle missing data
            if (optimalFaults !== null) {
                 if (faults > 0) {
                     efficiency = (optimalFaults / faults) * 100;
                 } else if (optimalFaults === 0 && faults === 0) {
                     efficiency = 100;
                 } else if (optimalFaults > 0 && faults === 0) {
                    efficiency = 0; // Or some other appropriate value for infinite efficiency?
                 }
            }
             efficiencyData.push(efficiency);

        } else {
            // Push null or 0 if no data for this algorithm
            pageFaultsData.push(null);
            pageHitsData.push(null);
            efficiencyData.push(null);
        }
    });

    
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Page Faults',
                    data: pageFaultsData,
                    backgroundColor: colors.map(color => `${color}80`),
                    borderColor: colors,
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Page Hits',
                    data: pageHitsData,
                    backgroundColor: colors.map(color => `${color}40`),
                    borderColor: colors,
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Efficiency (%)',
                    data: efficiencyData,
                    type: 'line',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y1',
                     tension: 0.1 // Add some curve to the line
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
             plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const value = context.raw;
                            if (context.dataset.label === 'Efficiency (%)') {
                                label += value !== null ? `${value.toFixed(1)}%` : 'N/A';
                             } else {
                                label += value !== null ? value : 'N/A';
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Count'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                     title: {
                        display: true,
                        text: 'Efficiency (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        // Ensure the efficiency axis shows percentage values
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                     min: 0, // Ensure efficiency starts at 0%
                     max: 100 // Efficiency cannot exceed 100% relative to optimal (unless Optimal has 0 faults and another algorithm does too, which is handled)
                },
                x: {
                    title: {
                        display: true,
                        text: 'Algorithms'
                    }
                }
            }
        }
    });
}

// Reset the simulation
function resetSimulation() {
    // Clear simulation
    simulationSteps = [];
    currentStep = 0;
    
    // Reset UI elements
    currentPageElem.textContent = '-';
    currentStepElem.textContent = '0';
    totalStepsElem.textContent = '0';
    stepResultElem.textContent = '-';
    memoryFramesElem.innerHTML = '';
    referenceStringVisualElem.innerHTML = '';
    pageFaultsElem.textContent = '0';
    pageHitsElem.textContent = '0';
    faultRatioElem.textContent = '0%';
    hitRatioElem.textContent = '0%';
    
    // Hide comparison container
    comparisonContainerElem.style.display = 'none';
    
    // Disable controls
    prevStepBtn.disabled = true;
    nextStepBtn.disabled = true;
    playBtn.disabled = true;
    
    // Stop playing if active
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Export as PDF
function exportPDF() {
    if (simulationSteps.length === 0) {
        alert('No simulation data to export.');
        return;
    }

    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    
    // Get the current algorithm name
    const algorithmName = document.querySelector('input[name="algorithm"]:checked').nextElementSibling.textContent;
    
    // Create the PDF content
    printWindow.document.write(`
        <html>
        <head>
            <title>PagePulse Simulation Results - ${algorithmName}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                .results { margin: 20px 0; }
                .result-item { margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
            </style>
        </head>
        <body>
            <h1>PagePulse Simulation Results</h1>
            <div class="results">
                <h2>Simulation Parameters</h2>
                <div class="result-item">
                    <strong>Algorithm:</strong> ${algorithmName}
                </div>
                <div class="result-item">
                    <strong>Reference String:</strong> ${referenceString.join(', ')}
                </div>
                <div class="result-item">
                    <strong>Number of Frames:</strong> ${frameCount}
                </div>
            </div>
            
            <div class="results">
                <h2>Results</h2>
                <div class="result-item">
                    <strong>Page Faults:</strong> ${pageFaultsElem.textContent}
                </div>
                <div class="result-item">
                    <strong>Page Hits:</strong> ${pageHitsElem.textContent}
                </div>
                <div class="result-item">
                    <strong>Fault Ratio:</strong> ${faultRatioElem.textContent}
                </div>
                <div class="result-item">
                    <strong>Hit Ratio:</strong> ${hitRatioElem.textContent}
                </div>
            </div>
            
            <div class="results">
                <h2>Simulation Steps</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Step</th>
                            <th>Page</th>
                            <th>Frames</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${simulationSteps.map((step, index) => `
                            <tr>
                                <td>${index}</td>
                                <td>${step.page !== null ? step.page : '-'}</td>
                                <td>${step.frames.map(f => f !== null ? f : '-').join(', ')}</td>
                                <td>${step.result}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `);
    
    // Wait for content to load then print
    printWindow.document.close();
    printWindow.onload = function() {
        printWindow.print();
    };
}

// Export as CSV
function exportCSV() {
    if (simulationSteps.length === 0) {
        alert('No simulation data to export.');
        return;
    }

    // Get the current algorithm name
    const algorithmName = document.querySelector('input[name="algorithm"]:checked').nextElementSibling.textContent;
    
    // Create CSV content
    const headers = ['Step', 'Page', 'Frames', 'Result', 'Page Faults', 'Page Hits'];
    const rows = simulationSteps.map((step, index) => [
        index,
        step.page !== null ? step.page : '-',
        step.frames.map(f => f !== null ? f : '-').join(','),
        step.result,
        step.pageFaults,
        step.pageHits
    ]);
    
    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `pagepulse_simulation_${algorithmName.toLowerCase()}_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
} 