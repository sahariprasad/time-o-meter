        const speedValEl = document.getElementById('speed-val');
        const speedLblEl = document.getElementById('speed-unit-lbl');
        const speedArc = document.getElementById('speed-arc');
        const speedTicks = document.getElementById('speed-ticks');
        const speedNeedle = document.getElementById('speed-needle');
        
        const paceValEl = document.getElementById('pace-val');
        const paceLblEl = document.getElementById('pace-unit-lbl');
        const paceArc = document.getElementById('pace-arc');
        const paceTicks = document.getElementById('pace-ticks');
        const paceNeedle = document.getElementById('pace-needle');

        const statusElement = document.getElementById('status');
        const debugElement = document.getElementById('debug');
        const unitBtns = document.querySelectorAll('.unit-btn');
        const modeBtns = document.querySelectorAll('.mode-btn');
        const startBtn = document.getElementById('btn-start');
        const previewContainer = document.getElementById('preview-container');
        const previewSlider = document.getElementById('preview-slider');
        const toggleSettingsBtn = document.getElementById('toggle-settings');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettingsBtn = document.getElementById('close-settings');

        toggleSettingsBtn.addEventListener('click', () => {
            settingsModal.showModal();
        });

        closeSettingsBtn.addEventListener('click', () => {
            settingsModal.close();
        });

        // Close modal when clicking on backdrop
        settingsModal.addEventListener('click', (e) => {
            const dialogDimensions = settingsModal.getBoundingClientRect();
            if (
                e.clientX < dialogDimensions.left ||
                e.clientX > dialogDimensions.right ||
                e.clientY < dialogDimensions.top ||
                e.clientY > dialogDimensions.bottom
            ) {
                settingsModal.close();
            }
        });

        let currentUnit = 'kmh';
        let currentSpeedMS = 0;
        let watchId = null;
        let lastPosition = null;
        let isPreviewMode = false;
        let wakeLock = null;

        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await navigator.wakeLock.request('screen');
                    wakeLock.addEventListener('release', () => {
                        console.log('Wake Lock released');
                    });
                    console.log('Wake Lock acquired');
                }
            } catch (err) {
                console.error(`Wake Lock error: ${err.name}, ${err.message}`);
            }
        };

        const releaseWakeLock = async () => {
            if (wakeLock !== null) {
                await wakeLock.release();
                wakeLock = null;
            }
        };

        document.addEventListener('visibilitychange', async () => {
            if (wakeLock !== null && document.visibilityState === 'visible') {
                requestWakeLock();
            }
        });

        const MS_TO_KMH = 3.6;
        const MS_TO_MPH = 2.23694;
        const ARC_LENGTH = 471.24; 
        const MAX_SPEED_KMH = 220;
        const MAX_SPEED_MPH = Math.round(MAX_SPEED_KMH / 1.60934); // ~137
        const MAX_PACE_MINUTES = 30;
        const MIN_PACE_MINUTES = 0.2; // Expanded to show 1 to 0 in detail

        function deg2rad(deg) { return deg * (Math.PI/180); }

        function drawTicks(groupEl, maxValue, isPace) {
            groupEl.innerHTML = '';
            const center = 120;
            const startAngle = 0; 
            
            if (!isPace) {
                // Linear Speed Scale
                const tickStep = 10;
                for (let val = 0; val <= maxValue; val += tickStep) {
                    const percent = val / maxValue;
                    const angle = startAngle + (percent * 270);
                    const rad = deg2rad(angle);
                    
                    const isMajor = val % 40 === 0;
                    
                    const rOuter = 95;
                    const rInner = isMajor ? 85 : 88;
                    
                    const x1 = center + rOuter * Math.cos(rad);
                    const y1 = center + rOuter * Math.sin(rad);
                    const x2 = center + rInner * Math.cos(rad);
                    const y2 = center + rInner * Math.sin(rad);
                    
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", x1);
                    line.setAttribute("y1", y1);
                    line.setAttribute("x2", x2);
                    line.setAttribute("y2", y2);
                    line.setAttribute("stroke", "#475569");
                    line.setAttribute("stroke-width", isMajor ? "2" : "1");
                    groupEl.appendChild(line);
                    
                    if (isMajor) {
                        const rText = 72;
                        const tx = center + rText * Math.cos(rad);
                        const ty = center + rText * Math.sin(rad);
                        
                        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                        text.setAttribute("x", tx);
                        text.setAttribute("y", ty);
                        text.setAttribute("fill", "#94a3b8");
                        text.setAttribute("font-size", "12");
                        text.setAttribute("font-family", "Outfit");
                        text.setAttribute("font-weight", "300");
                        text.setAttribute("text-anchor", "middle");
                        text.setAttribute("alignment-baseline", "middle");
                        text.setAttribute("transform", `rotate(-135, ${tx}, ${ty})`);
                        text.textContent = val;
                        groupEl.appendChild(text);
                    }
                }
            } else {
                // Logarithmic Pace Scale
                const majorPaces = [30, 20, 15, 10, 8, 6, 4, 2, 1, 0.5, 0];
                const minorPaces = [25, 12, 9, 7, 5, 3, 0.8, 0.6, 0.4, 0.2];
                
                const logMax = Math.log(MAX_PACE_MINUTES);
                const logMin = Math.log(MIN_PACE_MINUTES);
                
                const drawPaceTick = (val, isMajor) => {
                    // Calculate logarithmic percentage (inverted so 30 is at 0%, 1 is at 100%)
                    let percent = 1.0;
                    if (val > 0) {
                        percent = 1.0 - ((Math.log(val) - logMin) / (logMax - logMin));
                    }
                    const angle = startAngle + (percent * 270);
                    const rad = deg2rad(angle);
                    
                    const rOuter = 95;
                    const rInner = isMajor ? 85 : 88;
                    
                    const x1 = center + rOuter * Math.cos(rad);
                    const y1 = center + rOuter * Math.sin(rad);
                    const x2 = center + rInner * Math.cos(rad);
                    const y2 = center + rInner * Math.sin(rad);
                    
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", x1);
                    line.setAttribute("y1", y1);
                    line.setAttribute("x2", x2);
                    line.setAttribute("y2", y2);
                    line.setAttribute("stroke", "#475569");
                    line.setAttribute("stroke-width", isMajor ? "2" : "1");
                    groupEl.appendChild(line);
                    
                    if (isMajor) {
                        const rText = 72;
                        const tx = center + rText * Math.cos(rad);
                        const ty = center + rText * Math.sin(rad);
                        
                        const valStr = val === 30 ? '30+' : val;
                        
                        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                        text.setAttribute("x", tx);
                        text.setAttribute("y", ty);
                        text.setAttribute("fill", "#94a3b8");
                        text.setAttribute("font-size", "12");
                        text.setAttribute("font-family", "Outfit");
                        text.setAttribute("font-weight", "300");
                        text.setAttribute("text-anchor", "middle");
                        text.setAttribute("alignment-baseline", "middle");
                        text.setAttribute("transform", `rotate(-135, ${tx}, ${ty})`);
                        text.textContent = valStr;
                        groupEl.appendChild(text);
                    }
                };
                
                majorPaces.forEach(p => drawPaceTick(p, true));
                minorPaces.forEach(p => drawPaceTick(p, false));
            }
        }

        function getDistance(lat1, lon1, lat2, lon2) {
            const R = 6371e3;
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        function updateGauges() {
            let displaySpeed = 0;
            let displayPace = 0;
            let maxSpeed = 0;
            
            if (currentUnit === 'kmh') {
                displaySpeed = currentSpeedMS * MS_TO_KMH;
                maxSpeed = MAX_SPEED_KMH;
                speedLblEl.textContent = 'km/h';
                paceLblEl.textContent = 'min/km';
                displayPace = displaySpeed > 0 ? 60 / displaySpeed : Infinity;
            } else if (currentUnit === 'mph') {
                displaySpeed = currentSpeedMS * MS_TO_MPH;
                maxSpeed = MAX_SPEED_MPH;
                speedLblEl.textContent = 'mph';
                paceLblEl.textContent = 'min/mi';
                displayPace = displaySpeed > 0 ? 60 / displaySpeed : Infinity;
            }

            drawTicks(speedTicks, maxSpeed, false);
            drawTicks(paceTicks, MAX_PACE_MINUTES, true);

            speedValEl.textContent = displaySpeed.toFixed(1);
            if (displayPace === Infinity || displayPace > 99) {
                paceValEl.textContent = '∞';
            } else {
                paceValEl.textContent = displayPace.toFixed(1);
            }

            let speedPercent = Math.min(displaySpeed / maxSpeed, 1.0);
            speedArc.style.strokeDashoffset = ARC_LENGTH - (speedPercent * ARC_LENGTH);
            speedNeedle.style.transform = `rotate(${speedPercent * 270}deg)`;

            let pacePercent = 0.0;
            if (displayPace !== Infinity) {
                if (displayPace >= MAX_PACE_MINUTES) {
                    pacePercent = 0.0;
                } else if (displayPace <= MIN_PACE_MINUTES) {
                    pacePercent = 1.0;
                } else {
                    const logMax = Math.log(MAX_PACE_MINUTES);
                    const logMin = Math.log(MIN_PACE_MINUTES);
                    pacePercent = 1.0 - ((Math.log(displayPace) - logMin) / (logMax - logMin));
                }
            }
            paceArc.style.strokeDashoffset = ARC_LENGTH - (pacePercent * ARC_LENGTH);
            paceNeedle.style.transform = `rotate(${pacePercent * 270}deg)`;
        }

        unitBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                unitBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentUnit = e.target.getAttribute('data-unit');
                updateGauges();
            });
        });

        // Mode Switching (GPS vs Preview)
        modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                modeBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                isPreviewMode = e.target.getAttribute('data-mode') === 'preview';
                
                if (isPreviewMode) {
                    previewContainer.style.display = 'block';
                    startBtn.style.display = 'none';
                    if (watchId !== null) {
                        navigator.geolocation.clearWatch(watchId);
                        watchId = null;
                    }
                    statusElement.textContent = 'Preview Mode Active';
                    // Trigger a slider update immediately to match current slider position
                    previewSlider.dispatchEvent(new Event('input'));
                } else {
                    previewContainer.style.display = 'none';
                    startBtn.style.display = 'block';
                    statusElement.textContent = 'System Ready';
                    currentSpeedMS = 0;
                    updateGauges();
                }
            });
        });

        previewSlider.addEventListener('input', (e) => {
            if (!isPreviewMode) return;
            const percent = parseFloat(e.target.value) / 100.0;
            let maxS = MAX_SPEED_KMH;
            if (currentUnit === 'mph') maxS = MAX_SPEED_MPH;
            
            const currentSpeedInUnit = percent * maxS;
            
            if (currentUnit === 'mph') currentSpeedMS = currentSpeedInUnit / MS_TO_MPH;
            else currentSpeedMS = currentSpeedInUnit / MS_TO_KMH;
            
            updateGauges();
        });

        startBtn.addEventListener('click', () => {
            if (isPreviewMode) return;
            startBtn.style.display = 'none';
            debugElement.style.display = 'block';
            
            // Request wake lock when starting GPS
            requestWakeLock();
            
            if ('geolocation' in navigator) {
                statusElement.textContent = 'Acquiring GPS...';
                const options = { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 };

                function success(position) {
                    if (isPreviewMode) return; // ignore if switched
                    let debugInfo = `Lat: ${position.coords.latitude.toFixed(6)}<br>Lon: ${position.coords.longitude.toFixed(6)}<br>`;
                    
                    if (position.coords.speed !== null) {
                        currentSpeedMS = position.coords.speed;
                        statusElement.textContent = 'GPS Active';
                        debugInfo += `HW Speed: ${currentSpeedMS.toFixed(2)} m/s`;
                    } else {
                        if (lastPosition) {
                            const distance = getDistance(
                                lastPosition.coords.latitude, lastPosition.coords.longitude,
                                position.coords.latitude, position.coords.longitude
                            );
                            const timeDiff = (position.timestamp - lastPosition.timestamp) / 1000;
                            
                            if (timeDiff > 0) currentSpeedMS = distance / timeDiff;
                            statusElement.textContent = 'GPS Active (Calc)';
                        } else {
                            currentSpeedMS = 0;
                            statusElement.textContent = 'Waiting for movement...';
                        }
                    }
                    debugElement.innerHTML = debugInfo;
                    lastPosition = position;
                    updateGauges();
                }

                function error(err) {
                    if (isPreviewMode) return;
                    startBtn.style.display = 'block';
                    statusElement.textContent = 'GPS Error: ' + err.code;
                }

                watchId = navigator.geolocation.watchPosition(success, error, options);
            } else {
                statusElement.textContent = 'GPS Not Supported';
            }
        });

        updateGauges();
