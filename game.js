let questionsData = {};

        // Kana to Multi-romaji dictionary mapping
        const kanaToRomajiMap = {
            'あ':['a'], 'い':['i'], 'う':['u'], 'え':['e'], 'お':['o'],
            'か':['ka'], 'き':['ki'], 'く':['ku'], 'け':['ke'], 'こ':['ko'],
            'さ':['sa'], 'し':['si','shi'], 'す':['su'], 'せ':['se'], 'そ':['so'],
            'た':['ta'], 'ち':['ti','chi'], 'つ':['tu','tsu'], 'て':['te'], 'と':['to'],
            'な':['na'], 'に':['ni'], 'ぬ':['nu'], 'ね':['ne'], 'の':['no'],
            'は':['ha'], 'ひ':['hi'], 'ふ':['hu','fu'], 'へ':['he'], 'ほ':['ho'],
            'ま':['ma'], 'み':['mi'], 'む':['mu'], 'め':['me'], 'も':['mo'],
            'や':['ya'], 'ゆ':['yu'], 'よ':['yo'],
            'ら':['ra'], 'り':['ri'], 'る':['ru'], 'れ':['re'], 'ろ':['ro'],
            'わ':['wa'], 'を':['wo'], 'ん':['nn','n'],
            'が':['ga'], 'ぎ':['gi'], 'ぐ':['gu'], 'げ':['ge'], 'ご':['go'],
            'ざ':['za'], 'じ':['zi','ji'], 'ず':['zu'], 'ぜ':['ze'], 'ぞ':['zo'],
            'だ':['da'], 'ぢ':['di'], 'づ':['du'], 'で':['de'], 'ど':['do'],
            'ば':['ba'], 'び':['bi'], 'ぶ':['bu'], 'べ':['be'], 'ぼ':['bo'],
            'ぱ':['pa'], 'ぴ':['pi'], 'ぷ':['pu'], 'ぺ':['pe'], 'ぽ':['po'],
            'じゃ':['ja','zya','jya'], 'じゅ':['ju','zyu','jyu'], 'じょ':['jo','zyo','jyo'],
            'しゃ':['sha','sya'], 'しゅ':['shu','syu'], 'しょ':['sho','syo'],
            'びょ':['byo'],
            'でぃ':['dhi','di'],
            'てぃ':['ti','thi'],
            'ちゃ':['cha','tya'], 'ちゅ':['chu','tyu'], 'ちょ':['cho','tyo'],
            'きゃ':['kya'], 'きゅ':['kyu'], 'きょ':['kyo'],
            'にゃ':['nya'], 'にゅ':['nyu'], 'にょ':['nyo'],
            'ひゃ':['hya'], 'ひゅ':['hyu'], 'ひょ':['hyo'],
            'みゃ':['mya'], 'みゅ':['myu'], 'みょ':['myo'],
            'りゃ':['rya'], 'りゅ':['ryu'], 'りょ':['ryo'],
            'ぎゃ':['gya'], 'ぎゅ':['gyu'], 'ぎょ':['gyo'],
            'ふぁ':['fa','fuxa'], 'ふぃ':['fi','fuxi'], 'ふぇ':['fe','fuxe'], 'ふぉ':['fo','fuxo'],
            'ー':['-']
        };

        function convertKanaToDefaultRomaji(kanaStr) {
            let res = "";
            let i = 0;
            while (i < kanaStr.length) {
                if (i + 1 < kanaStr.length) {
                    let sub2 = kanaStr.substring(i, i + 2);
                    if (kanaToRomajiMap[sub2]) {
                        res += kanaToRomajiMap[sub2][0];
                        i += 2;
                        continue;
                    }
                }
                let char = kanaStr[i];
                if (char === 'っ' && i + 1 < kanaStr.length) {
                    let nextC = kanaStr[i+1];
                    let nextRoma = kanaToRomajiMap[nextC] ? kanaToRomajiMap[nextC][0] : 'k';
                    res += nextRoma[0];
                    i++;
                    continue;
                }
                if (kanaToRomajiMap[char]) {
                    res += kanaToRomajiMap[char][0];
                } else {
                    res += char;
                }
                i++;
            }
            return res;
        }

        let selectedGameTime = 180;
        let timer = 180;
        let selectedQuestionGroup = '5-8';
        let elapsedGameSeconds = 0;
        let isGaming = false;
        let isDebugMode = false;
        let timerInterval = null;
        let platePlaceTimeout = null;
        let pendingFinalNTimeout = null;
        let currentQuestion = null;
        let currentRomaTarget = "";
        let typedRomaIndex = 0;
        let totalTypedKeys = 0;
        let totalMisses = 0;
        let consecutiveCorrectKeys = 0;
        let platesCleared = 0;
        let score = 0;
        let questionList = [];
        let audioContext = null;

        const timerDisplay = document.getElementById('timer-display');
        const platesCountDisplay = document.getElementById('plates-count');
        const scoreDisplay = document.getElementById('score-display');
        const accuracyDisplay = document.getElementById('accuracy-display');
        const streakDisplay = document.getElementById('streak-display');
        const bonusNextDisplay = document.getElementById('bonus-next-display');
        const streakMeter = document.getElementById('streak-meter');
        const streakProgress = document.getElementById('streak-progress');
        
        const kanjiDisplay = document.getElementById('kanji-display');
        const nextWordPreview = document.getElementById('next-word-preview');
        const nextWordText = document.getElementById('next-word-text');
        const romaTyped = document.getElementById('roma-typed');
        const romaUntyped = document.getElementById('roma-untyped');
        
        const startOverlay = document.getElementById('start-overlay');
        const resultOverlay = document.getElementById('result-overlay');
        const conveyorBelt = document.getElementById('conveyor-belt');
        const sushiPlate = document.getElementById('sushi-plate');
        const sushiBounce = document.getElementById('sushi-bounce');
        const sushiSvg = document.getElementById('sushi-svg');
        const beltGuide = document.getElementById('belt-guide');

        function setGameTime(sec) {
            selectedGameTime = sec;
            timer = sec;
            timerDisplay.textContent = sec;
            
            document.querySelectorAll('.time-select-btn').forEach(btn => {
                btn.classList.remove('bg-amber-500', 'border-amber-400', 'text-slate-950', 'shadow-md');
                btn.classList.add('bg-slate-800', 'border-slate-700', 'text-slate-300');
            });
            const activeBtn = document.getElementById(`time-btn-${sec}`);
            if(activeBtn) {
                activeBtn.classList.add('bg-amber-500', 'border-amber-400', 'text-slate-950', 'shadow-md');
                activeBtn.classList.remove('bg-slate-800', 'border-slate-700', 'text-slate-300');
            }
        }

        function setQuestionGroup(group) {
            selectedQuestionGroup = group;
            document.querySelectorAll('.group-select-btn').forEach(btn => {
                btn.classList.remove('bg-amber-500', 'border-amber-400', 'text-slate-950', 'shadow-md');
                btn.classList.add('bg-slate-800', 'border-slate-700', 'text-slate-300');
            });
            const activeBtn = document.getElementById(`group-btn-${group}`);
            if (activeBtn) {
                activeBtn.classList.add('bg-amber-500', 'border-amber-400', 'text-slate-950', 'shadow-md');
                activeBtn.classList.remove('bg-slate-800', 'border-slate-700', 'text-slate-300');
            }
        }

        function startGame(debugMode = false) {
            const selectedQuestions = questionsData[selectedQuestionGroup];
            if (!selectedQuestions?.length) return;
            isGaming = true;
            isDebugMode = debugMode;
            timer = debugMode ? 10 : selectedGameTime;
            timerDisplay.textContent = timer;
            elapsedGameSeconds = 0;
            totalTypedKeys = 0;
            totalMisses = 0;
            consecutiveCorrectKeys = 0;
            platesCleared = 0;
            score = 0;

            questionList = [...selectedQuestions].sort(() => Math.random() - 0.5);

            document.body.classList.remove('title-screen');
            startOverlay.classList.add('hidden');
            resultOverlay.classList.add('hidden');
            nextWordPreview.classList.remove('hidden');
            beltGuide.classList.add('hidden');
            conveyorBelt.classList.remove('hidden');

            updateDashboard();

            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timer--;
                elapsedGameSeconds++;
                timerDisplay.textContent = timer;
                if (timer <= 0) {
                    endGame();
                }
            }, 1000);

            nextQuestion();
        }

        function resetToTitle() {
            isGaming = false;
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            if (platePlaceTimeout) {
                clearTimeout(platePlaceTimeout);
                platePlaceTimeout = null;
            }
            if (pendingFinalNTimeout) {
                clearTimeout(pendingFinalNTimeout);
                pendingFinalNTimeout = null;
            }
            sushiPlate.onanimationend = null;
            sushiPlate.style.animation = 'none';
            timer = selectedGameTime;
            elapsedGameSeconds = 0;
            timerDisplay.textContent = timer;
            consecutiveCorrectKeys = 0;
            isDebugMode = false;
            updateDashboard();
            document.body.classList.add('title-screen');
            resultOverlay.classList.add('hidden');
            startOverlay.classList.remove('hidden');
            nextWordPreview.classList.add('hidden');
            conveyorBelt.classList.add('hidden');
            beltGuide.classList.remove('hidden');
            kanjiDisplay.textContent = "";
            romaTyped.textContent = "";
            romaUntyped.textContent = "";
        }

        function renderSushiSvg(type) {
            if (type === 'dna') {
                sushiSvg.innerHTML = `
                    <path d="M 10 25 Q 25 5, 40 25 T 70 25 T 100 25" fill="none" stroke="#ef4444" stroke-width="4"/>
                    <path d="M 10 25 Q 25 45, 40 25 T 70 25 T 100 25" fill="none" stroke="#3b82f6" stroke-width="4"/>
                    <line x1="25" y1="15" x2="25" y2="35" stroke="#eab308" stroke-width="3"/>
                    <line x1="55" y1="15" x2="55" y2="35" stroke="#10b981" stroke-width="3"/>
                `;
            } else if (type === 'cell') {
                sushiSvg.innerHTML = `
                    <ellipse cx="50" cy="25" rx="35" ry="18" fill="#10b981" opacity="0.8"/>
                    <circle cx="50" cy="25" r="8" fill="#1e3a8a"/>
                    <circle cx="35" cy="20" r="4" fill="#f59e0b"/>
                    <circle cx="65" cy="28" r="3" fill="#ef4444"/>
                `;
            } else if (type === 'eco') {
                sushiSvg.innerHTML = `
                    <path d="M 50 5 L 75 40 L 25 40 Z" fill="#22c55e"/>
                    <path d="M 50 15 L 70 42 L 30 42 Z" fill="#15803d"/>
                    <rect x="46" y="40" width="8" height="8" fill="#78350f"/>
                `;
            } else {
                sushiSvg.innerHTML = `
                    <circle cx="35" cy="25" r="14" fill="#3b82f6"/>
                    <circle cx="65" cy="25" r="14" fill="#ec4899"/>
                    <path d="M 40 18 L 60 32" stroke="#ffffff" stroke-width="3"/>
                `;
            }
        }

        function nextQuestion() {
            if (!isGaming) return;
            if (pendingFinalNTimeout) {
                clearTimeout(pendingFinalNTimeout);
                pendingFinalNTimeout = null;
            }
            refillQuestionList();

            currentQuestion = questionList.pop();
            updateNextQuestionPreview();
            kanjiDisplay.textContent = currentQuestion.text;
            renderSushiSvg(currentQuestion.type);

            currentRomaTarget = convertKanaToDefaultRomaji(currentQuestion.kana);
            typedRomaIndex = 0;

            updateRomaDisplay();
            startPlateAnimation();
        }

        function refillQuestionList() {
            if (questionList.length === 0) {
                questionList = [...questionsData[selectedQuestionGroup]].sort(() => Math.random() - 0.5);
            }
        }

        function updateNextQuestionPreview() {
            refillQuestionList();
            nextWordText.textContent = questionList[questionList.length - 1].text;
        }

        function startPlateAnimation() {
            sushiPlate.style.animation = 'none';
            sushiPlate.offsetHeight;
            sushiPlate.style.animation = 'conveyor 15s linear forwards';
            if (platePlaceTimeout) clearTimeout(platePlaceTimeout);
            platePlaceTimeout = setTimeout(() => {
                platePlaceTimeout = null;
                if (isGaming) playPlatePlaceSound();
            }, 140);

            sushiPlate.onanimationend = (event) => {
                if (event.target === sushiPlate && event.animationName === 'conveyor' && isGaming) {
                    nextQuestion();
                }
            };
        }

        function updateRomaDisplay() {
            romaTyped.textContent = currentRomaTarget.substring(0, typedRomaIndex);
            romaUntyped.textContent = currentRomaTarget.substring(typedRomaIndex);
        }

        function updateDashboard() {
            platesCountDisplay.textContent = platesCleared;
            scoreDisplay.textContent = score;
            let total = totalTypedKeys + totalMisses;
            let acc = total > 0 ? Math.round((totalTypedKeys / total) * 100) : 100;
            accuracyDisplay.textContent = acc + "%";

            const progress = consecutiveCorrectKeys % 25;
            const nextBonus = Math.floor((consecutiveCorrectKeys % 75) / 25) + 1;
            streakDisplay.textContent = `${progress} / 25`;
            bonusNextDisplay.textContent = `次: +${nextBonus}秒`;
            streakMeter.setAttribute('aria-valuenow', progress);
            streakProgress.style.width = `${progress * 4}%`;
        }

        function canOmitNAt(index) {
            if (currentRomaTarget[index - 1] !== 'n' || currentRomaTarget[index] !== 'n') return false;
            const followingRomaji = currentRomaTarget.substring(index);
            return !/^(?:na|ni|nu|ne|no|nya|nyu|nyo)/.test(followingRomaji);
        }

        function completeCurrentQuestion() {
            if (pendingFinalNTimeout) {
                clearTimeout(pendingFinalNTimeout);
                pendingFinalNTimeout = null;
            }
            platesCleared++;
            score += 120;
            playPlateCollectSound();
            updateDashboard();
            nextQuestion();
        }

        function completeWithSingleFinalN() {
            pendingFinalNTimeout = null;
            if (!isGaming || typedRomaIndex !== currentRomaTarget.length - 1 || !currentRomaTarget.endsWith('nn')) return;
            currentRomaTarget = currentRomaTarget.slice(0, -1);
            typedRomaIndex = currentRomaTarget.length;
            updateRomaDisplay();
            completeCurrentQuestion();
        }

        function getAudioContext() {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return null;

            audioContext ??= new AudioContextClass();
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            return audioContext;
        }

        function playTone(frequency, endFrequency, delay, duration, volume, waveform) {
            const context = getAudioContext();
            if (!context) return;

            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const startAt = context.currentTime + delay;

            oscillator.type = waveform;
            oscillator.frequency.setValueAtTime(frequency, startAt);
            oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startAt + duration);
            gain.gain.setValueAtTime(0.001, startAt);
            gain.gain.linearRampToValueAtTime(volume, startAt + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(startAt);
            oscillator.stop(startAt + duration);
        }

        function playKeySound(isCorrect) {
            playTone(isCorrect ? 660 : 220, isCorrect ? 660 : 220, 0, 0.06, 0.08, 'sine');
        }

        function playPlateCollectSound() {
            playTone(880, 1320, 0, 0.1, 0.09, 'sine');
            playTone(1320, 1760, 0.055, 0.15, 0.06, 'sine');
        }

        function playPlatePlaceSound() {
            playTone(190, 85, 0, 0.13, 0.14, 'sine');
            playTone(430, 250, 0.005, 0.045, 0.025, 'triangle');
        }

        function animateSushiBounce() {
            sushiBounce.classList.remove('plate-bounce');
            void sushiBounce.offsetHeight;
            sushiBounce.classList.add('plate-bounce');
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                resetToTitle();
                return;
            }

            if (!isGaming && e.code === 'KeyD' && e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                startGame(true);
                return;
            }

            if (!isGaming && e.code === 'Space') {
                e.preventDefault();
                startGame();
                return;
            }

            if (!isGaming) return;
            if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;

            animateSushiBounce();
            let pressedKey = e.key.toLowerCase();
            if (pendingFinalNTimeout) {
                clearTimeout(pendingFinalNTimeout);
                pendingFinalNTimeout = null;
                if (pressedKey !== 'n') {
                    completeWithSingleFinalN();
                }
            }
            let expectedChar = currentRomaTarget[typedRomaIndex]?.toLowerCase();

            let isCorrect = false;

            const followingChar = currentRomaTarget[typedRomaIndex + 1];
            if (expectedChar === 'n' && canOmitNAt(typedRomaIndex) && followingChar !== 'n' && pressedKey === followingChar) {
                currentRomaTarget = currentRomaTarget.substring(0, typedRomaIndex) + currentRomaTarget.substring(typedRomaIndex + 1);
                isCorrect = true;
            } else if (pressedKey === expectedChar) {
                isCorrect = true;
            } else {
                // Check 'ji' vs 'zi'
                if (expectedChar === 'z' && currentRomaTarget.substring(typedRomaIndex, typedRomaIndex+2) === 'zi' && pressedKey === 'j') {
                    currentRomaTarget = currentRomaTarget.substring(0, typedRomaIndex) + "ji" + currentRomaTarget.substring(typedRomaIndex+2);
                    isCorrect = true;
                } else if (expectedChar === 'j' && currentRomaTarget.substring(typedRomaIndex, typedRomaIndex+2) === 'ji' && pressedKey === 'z') {
                    currentRomaTarget = currentRomaTarget.substring(0, typedRomaIndex) + "zi" + currentRomaTarget.substring(typedRomaIndex+2);
                    isCorrect = true;
                }
                // Check Ja / Zy / Jy variants (ja vs zya vs jya)
                else if (expectedChar === 'j' && currentRomaTarget.substring(typedRomaIndex, typedRomaIndex+2) === 'ja' && pressedKey === 'z') {
                    currentRomaTarget = currentRomaTarget.substring(0, typedRomaIndex) + "zya" + currentRomaTarget.substring(typedRomaIndex+2);
                    isCorrect = true;
                } else if (expectedChar === 'z' && currentRomaTarget.substring(typedRomaIndex, typedRomaIndex+3) === 'zya' && pressedKey === 'j') {
                    currentRomaTarget = currentRomaTarget.substring(0, typedRomaIndex) + "ja" + currentRomaTarget.substring(typedRomaIndex+3);
                    isCorrect = true;
                } else if (expectedChar === 'j' && currentRomaTarget.substring(typedRomaIndex, typedRomaIndex+2) === 'ju' && pressedKey === 'z') {
                    currentRomaTarget = currentRomaTarget.substring(0, typedRomaIndex) + "zyu" + currentRomaTarget.substring(typedRomaIndex+2);
                    isCorrect = true;
                } else if (expectedChar === 'j' && currentRomaTarget.substring(typedRomaIndex, typedRomaIndex+2) === 'jo' && pressedKey === 'z') {
                    currentRomaTarget = currentRomaTarget.substring(0, typedRomaIndex) + "zyo" + currentRomaTarget.substring(typedRomaIndex+2);
                    isCorrect = true;
                }
                // Allow "sya/syu/syo" as alternatives to "sha/shu/sho".
                else if (expectedChar === 'h' && pressedKey === 'y') {
                    const chunkStart = typedRomaIndex - 1;
                    const chunk = currentRomaTarget.substring(chunkStart, chunkStart + 3);
                    const alternatives = { sha: 'sya', shu: 'syu', sho: 'syo' };
                    if (alternatives[chunk]) {
                        currentRomaTarget = currentRomaTarget.substring(0, chunkStart) + alternatives[chunk] + currentRomaTarget.substring(chunkStart + 3);
                        isCorrect = true;
                    }
                }
                // Allow "tya/tyu/tyo" as alternatives to "cha/chu/cho".
                else if (expectedChar === 'c' && pressedKey === 't') {
                    const chunk = currentRomaTarget.substring(typedRomaIndex, typedRomaIndex + 3);
                    const alternatives = { cha: 'tya', chu: 'tyu', cho: 'tyo' };
                    if (alternatives[chunk]) {
                        currentRomaTarget = alternatives[chunk] + currentRomaTarget.substring(typedRomaIndex + 3);
                        isCorrect = true;
                    }
                }
                // Check Flexible 'tsu' vs 'tu'
                else if (expectedChar === 's' && currentRomaTarget.substring(typedRomaIndex-1, typedRomaIndex+2) === 'tsu' && pressedKey === 'u') {
                    currentRomaTarget = currentRomaTarget.substring(0, typedRomaIndex-1) + "tu" + currentRomaTarget.substring(typedRomaIndex+2);
                    expectedChar = 'u';
                    typedRomaIndex--;
                    isCorrect = true;
                }
            }

            playKeySound(isCorrect);

            if (isCorrect) {
                consecutiveCorrectKeys++;
                if (!isDebugMode && consecutiveCorrectKeys % 25 === 0) {
                    const bonusSeconds = Math.floor((consecutiveCorrectKeys - 1) / 25) % 3 + 1;
                    timer += bonusSeconds;
                    timerDisplay.textContent = timer;
                }
                typedRomaIndex++;
                totalTypedKeys++;
                score += 10;
                updateRomaDisplay();
                updateDashboard();

                if (typedRomaIndex >= currentRomaTarget.length) {
                    completeCurrentQuestion();
                } else if (
                    typedRomaIndex === currentRomaTarget.length - 1 &&
                    currentRomaTarget.endsWith('nn') &&
                    currentQuestion.kana.endsWith('ん')
                ) {
                    pendingFinalNTimeout = setTimeout(completeWithSingleFinalN, 350);
                }
            } else {
                consecutiveCorrectKeys = 0;
                totalMisses++;
                updateDashboard();
                
                const card = document.getElementById('typing-card');
                card.classList.add('shake', 'border-rose-500');
                setTimeout(() => {
                    card.classList.remove('shake', 'border-rose-500');
                }, 200);
            }
        });

        function endGame() {
            isGaming = false;
            isDebugMode = false;
            clearInterval(timerInterval);
            timerInterval = null;
            if (platePlaceTimeout) {
                clearTimeout(platePlaceTimeout);
                platePlaceTimeout = null;
            }
            if (pendingFinalNTimeout) {
                clearTimeout(pendingFinalNTimeout);
                pendingFinalNTimeout = null;
            }

            let elapsedSeconds = Math.max(elapsedGameSeconds, 1);
            let kps = elapsedSeconds > 0 ? (totalTypedKeys / elapsedSeconds).toFixed(1) : 0;
            
            document.getElementById('res-plates').textContent = platesCleared;
            document.getElementById('res-score').textContent = score;
            document.getElementById('res-keys').textContent = totalTypedKeys;
            document.getElementById('res-misses').textContent = totalMisses;
            document.getElementById('res-kps').textContent = kps;

            let total = totalTypedKeys + totalMisses;
            let acc = total > 0 ? Math.round((totalTypedKeys / total) * 100) : 0;
            document.getElementById('res-accuracy').textContent = acc + "%";

            let rank = "前頭";
            if (platesCleared >= Math.round(elapsedSeconds / 7.2) || kps >= 4.5) {
                rank = "横綱 👑";
            } else if (platesCleared >= Math.round(elapsedSeconds / 9) || kps >= 3.8) {
                rank = "大関 🍣";
            } else if (platesCleared >= Math.round(elapsedSeconds / 12) || kps >= 3.0) {
                rank = "関脇 ⚔️";
            } else if (platesCleared >= Math.round(elapsedSeconds / 18) || kps >= 2.0) {
                rank = "小結 🥋";
            }

            document.getElementById('res-rank').textContent = rank;
            resultOverlay.classList.remove('hidden');
        }

        async function loadQuestions() {
            const startButton = document.getElementById('start-button');
            const status = document.getElementById('question-load-status');
            try {
                const response = await fetch('question.json');
                if (!response.ok) {
                    throw new Error(`question.json の読み込みに失敗しました (HTTP ${response.status})`);
                }
                const data = await response.json();
                const questionGroups = ['5-8', '9-12', '13-16', '17-20'];
                if (!data || questionGroups.some(group => !Array.isArray(data[group]) || data[group].length === 0)) {
                    throw new Error('question.json の問題データの形式が正しくありません。');
                }
                questionsData = data;
                startButton.disabled = false;
                status.textContent = '';
            } catch (error) {
                console.error('問題データの読み込みに失敗しました。', error);
                status.textContent = '問題データを読み込めません。ローカルHTTPサーバー経由で開いてください。';
                status.classList.add('text-rose-400');
            }
        }

        loadQuestions();
