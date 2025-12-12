class RetroTerminal {
    constructor() {
        this.terminalInput = document.getElementById('terminalInput');
        this.terminalOutput = document.getElementById('terminalOutput');
        this.windowsContainer = document.getElementById('windowsContainer');
        this.windows = [];
        this.windowZIndex = 100;
        this.currentWindow = null;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.colorScheme = 'neon-green';
        this.terminalTheme = 'default';
        this.typingSpeed = 30;
        this.minimizedWindows = [];
        this.allCommands = ['help', 'about', 'projects', 'skills', 'contact', 'quote', 'surprise', 'neo', 'color', 'theme', 'clear', 'exit', 'quit', 'snake', 'pong'];
        this.autocompleteMatches = [];
        this.autocompleteIndex = -1;
        this.suggestionEl = null;
        
        this.init();
    }

    init() {
        this.terminalInput.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.terminalInput.addEventListener('input', () => {
            this.updateCursor();
            try { this.updateAutocomplete(); } catch (e) {}
        });
        this.terminalInput.addEventListener('click', () => this.updateCursor());
        this.terminalInput.addEventListener('keyup', () => this.updateCursor());
        this.terminalInput.addEventListener('focus', () => this.updateCursor());
        this.terminalInput.addEventListener('blur', () => {
        });

        document.getElementById('terminalContainer').addEventListener('click', () => {
            this.terminalInput.focus();
        });

        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.cycleWindows();
            }
        });

        this.windowsContainer.addEventListener('contextmenu', (e) => e.preventDefault());

        try { this.loadSettings(); } catch (e) {}

        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);

        document.addEventListener('keydown', (e) => {
            const active = document.activeElement;
            const isEditing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
            if (isEditing) return;
            if (e.key === '/') {
                e.preventDefault();
                try { this.terminalInput.focus();
                    const start = this.terminalInput.selectionStart || 0;
                    const end = this.terminalInput.selectionEnd || 0;
                    const val = this.terminalInput.value || '';
                    this.terminalInput.value = val.slice(0, start) + '/' + val.slice(end);
                    this.terminalInput.selectionStart = this.terminalInput.selectionEnd = start + 1;
                } catch (err) { this.terminalInput.focus(); }
            }
        }, true);

        document.addEventListener('keydown', (e) => {
            const active = document.activeElement;
            const isEditing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
            if (isEditing) return; // don't steal focus when user is in a form

            if (e.ctrlKey || e.metaKey) return;

            if (e.key && e.key.length === 1 && !e.altKey) {
                e.preventDefault();
                try {
                    this.terminalInput.focus();
                    const start = this.terminalInput.selectionStart || 0;
                    const val = this.terminalInput.value || '';
                    this.terminalInput.value = val.slice(0, start) + e.key + val.slice(start);
                    this.terminalInput.selectionStart = this.terminalInput.selectionEnd = start + 1;
                    try { this.updateCursor(); } catch (err) {}
                } catch (err) {
                    // fallback: just focus
                    try { this.terminalInput.focus(); } catch (e) {}
                }
            } else {
                try { this.terminalInput.focus(); } catch (e) {}
            }
        }, false);

        setTimeout(() => this.updateCursor(), 0);
    }

    loadSettings() {
        try {
            const storedScheme = localStorage.getItem('rivs_colorScheme');
            const storedTheme = localStorage.getItem('rivs_theme');
            if (storedScheme) this.switchColorScheme(storedScheme, true);
            if (storedTheme) this.switchTheme(storedTheme, true);
        } catch (e) {  }
    }

    ensurePromptVisible() {
        try {
            const input = this.terminalInput || document.getElementById('terminalInput');
            if (input && typeof input.scrollIntoView === 'function') {
                input.scrollIntoView({ block: 'end', inline: 'nearest' });
            }
        } catch (e) {
        }
    }

    trimOutput(maxLines = 200) {
        try {
            const out = this.terminalOutput;
            if (!out) return;

            const bar = document.querySelector('.top-center-bar');
            if (bar) {
                const barRect = bar.getBoundingClientRect();
                let removed = 0;
                while (out.firstChild && removed < 1000) {
                    const first = out.firstChild;
                    const rect = first.getBoundingClientRect();
                    if (rect.bottom < barRect.bottom) {
                        out.removeChild(first);
                        removed++;
                    } else {
                        break;
                    }
                }
                return;
            }

            while (out.children.length > maxLines) {
                out.removeChild(out.firstChild);
            }
        } catch (e) {
        }
    }

    handleKeyPress(e) {
        // If autocomplete suggestions are visible, let arrows and Tab/Enter interact with them
        const suggestionsVisible = this.suggestionEl && this.suggestionEl.style.display === 'block';
        if (suggestionsVisible && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault();
            const dir = e.key === 'ArrowUp' ? -1 : 1;
            this.navigateAutocomplete(dir);
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            if (suggestionsVisible && this.autocompleteMatches.length > 0 && this.autocompleteIndex >= 0) {
                this.acceptAutocomplete(this.autocompleteIndex);
                return;
            }
            this.processCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory(1);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (suggestionsVisible && this.autocompleteMatches.length > 0) {
                const idx = this.autocompleteIndex >= 0 ? this.autocompleteIndex : 0;
                this.acceptAutocomplete(idx);
            } else {
                this.autocompleteCommand();
            }
        }
    }

    // Autocomplete UI and logic
    updateAutocomplete() {
        try {
            const val = (this.terminalInput.value || '').trim().toLowerCase();
            if (!val) { this.hideAutocomplete(); return; }

            const matches = this.allCommands.filter(cmd => cmd.startsWith(val));
            if (!matches || matches.length === 0) { this.hideAutocomplete(); return; }

            this.autocompleteMatches = matches;
            if (this.autocompleteIndex >= matches.length) this.autocompleteIndex = matches.length - 1;
            if (this.autocompleteIndex < 0) this.autocompleteIndex = -1;

            if (!this.suggestionEl) {
                this.suggestionEl = document.createElement('div');
                this.suggestionEl.className = 'autocomplete-suggestions';
                document.body.appendChild(this.suggestionEl);
            }

            // Build list
            this.suggestionEl.innerHTML = '';
            matches.slice(0, 10).forEach((m, i) => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                if (i === this.autocompleteIndex) item.classList.add('active');
                item.textContent = m;
                item.addEventListener('mousedown', (ev) => {
                    ev.preventDefault();
                    this.acceptAutocomplete(i);
                });
                this.suggestionEl.appendChild(item);
            });

            // Position near input
            const rect = this.terminalInput.getBoundingClientRect();
            this.suggestionEl.style.position = 'absolute';
            this.suggestionEl.style.left = `${rect.left + window.scrollX}px`;
            this.suggestionEl.style.top = `${rect.bottom + window.scrollY + 6}px`;
            this.suggestionEl.style.minWidth = `${Math.max(160, rect.width)}px`;
            this.suggestionEl.style.display = 'block';
        } catch (e) {
            this.hideAutocomplete();
        }
    }

    navigateAutocomplete(dir) {
        try {
            if (!this.autocompleteMatches || this.autocompleteMatches.length === 0) return;
            if (this.autocompleteIndex === -1) {
                this.autocompleteIndex = dir > 0 ? 0 : this.autocompleteMatches.length - 1;
            } else {
                this.autocompleteIndex = (this.autocompleteIndex + dir + this.autocompleteMatches.length) % this.autocompleteMatches.length;
            }
            // update active class
            const items = this.suggestionEl ? Array.from(this.suggestionEl.children) : [];
            items.forEach((it, i) => it.classList.toggle('active', i === this.autocompleteIndex));
        } catch (e) {}
    }

    acceptAutocomplete(index) {
        try {
            if (!this.autocompleteMatches || this.autocompleteMatches.length === 0) return;
            const pick = this.autocompleteMatches[index] || this.autocompleteMatches[0];
            this.terminalInput.value = pick;
            this.terminalInput.focus();
            this.terminalInput.selectionStart = this.terminalInput.selectionEnd = this.terminalInput.value.length;
            this.hideAutocomplete();
        } catch (e) {}
    }

    hideAutocomplete() {
        try {
            if (this.suggestionEl) this.suggestionEl.style.display = 'none';
            this.autocompleteMatches = [];
            this.autocompleteIndex = -1;
        } catch (e) {}
    }

    autocompleteCommand() {
        const input = this.terminalInput.value.trim().toLowerCase();
        if (!input) return;

        const matches = this.allCommands.filter(cmd => cmd.startsWith(input));
        
        if (matches.length === 1) {
            this.terminalInput.value = matches[0];
        } else if (matches.length > 1) {
            this.addOutputLine(`Suggestions: ${matches.join(', ')}`, 'info-text');
        }
    }

    updateDateTime() {
        try {
            let bar = document.querySelector('.top-center-bar');
            if (!bar) { bar = document.createElement('div'); bar.className = 'top-center-bar'; document.body.appendChild(bar); }
            const now = new Date();
            const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
            const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
            const dateStr = now.toLocaleDateString(undefined, dateOptions);
            const timeStr = now.toLocaleTimeString(undefined, timeOptions);
            bar.innerHTML = `<span class="datetime-display">${dateStr} ${timeStr}</span>`;
        } catch (err) { }
    }

    processCommand() {
        const command = this.terminalInput.value.trim().toLowerCase();
        if (command === '') { this.addOutputLine('', 'prompt'); return; }
        this.commandHistory.push(command); this.historyIndex = -1;
        this.addOutputLine(`sudo@rivsportfolio:~$ ${command}`, 'prompt');
        this.executeCommand(command);
        this.terminalInput.value = ''; this.terminalInput.focus();
    }

    executeCommand(command) {
        const [cmd, ...args] = command.split(' ');

        switch (cmd) {
            case 'help':
                this.showHelp();
                break;
            case 'about':
                this.showAbout();
                break;
            case 'projects':
                this.showProjects();
                break;
            case 'skills':
                this.showSkills();
                break;
            case 'contact':
                this.showContact();
                break;
            case 'quote':
                this.showquote();
                break;
            case 'surprise':
                this.surprise();
                break;
            case 'neo':
                this.startneo();
                break;
            case 'snake':
                this.startSnakeGame();
                break;
            case 'pong':
                this.startPongGame();
                break;
            case 'theme':
                if (args.length > 0) {
                    const themeName = args.join(' ').trim();
                    this.switchTheme(themeName);
                } else {
                    this.showThemeOptions();
                }
                break;
            case 'color':
                if (args.length > 0) {
                    this.switchColorScheme(args[0]);
                } else {
                    this.showColorOptions();
                }
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'exit':
            case 'quit':
                this.addOutputLine('nah', 'error-text');
                break;
            default:
                this.addOutputLine(`${cmd}? What do you mean? Use "help" for what can be used.`, 'error-text');
        }
    }

    addOutputLine(text, className = '') {
        try { this.trimOutput(200); } catch (e) {}
        const line = document.createElement('div'); line.className = `terminal-line ${className}`; this.terminalOutput.appendChild(line);
        let charIndex = 0;
        const typeCharacter = () => {
            if (charIndex < text.length) {
                line.innerHTML += text[charIndex++];
                try { this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight; } catch (e) {}
                try { this.ensurePromptVisible(); } catch (e) {}
                setTimeout(typeCharacter, this.typingSpeed);
            }
        };
        typeCharacter();
        try { this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight; } catch (e) {}
        try { this.ensurePromptVisible(); } catch (e) {}
    }

    showHelp() {
        const commands = [
            { name: 'help', desc: 'available commands' },
            { name: 'about', desc: 'jus a lil about me' },
            { name: 'projects', desc: 'my projects' },
            { name: 'skills', desc: 'what I can do' },
            { name: 'contact', desc: 'contact me' },
            { name: 'quote', desc: 'wisdom' },
            { name: 'surprise', desc: 'who knows' },
            { name: 'neo', desc: 'what movie is that from??' },
            { name: 'color [scheme]', desc: 'switch color scheme' },
            { name: 'theme [name]', desc: 'switch terminal theme' },
            { name: 'clear', desc: 'clear terminal' },
            { name: 'snake', desc: 'play a fun lil game' },
            { name: 'pong', desc: 'not of the ping variety' },
            { name: 'exit', desc: 'self explanatory' }
        ];

        this.createWindow('Help', () => {
            let html = '<ul class="command-list">';
            commands.forEach(cmd => {
                html += `
                    <li class="command-item">
                        <span class="command-name">${cmd.name}</span>
                        <span class="command-desc">${cmd.desc}</span>
                    </li>
                `;
            });
            html += '</ul>';
            return html;
        });
    }

    showAbout() {
        this.createWindow('About Me', () => {
            return `
                <div class="about-content">
                    <div class="about-section">
                        <h3>WHO AM I?</h3>
                        <p>I am a high school student based in the US who likes building things and solving problems.</p>
                    </div>
                    <div class="about-section">
                        <h3>WHAT I DO</h3>
                        <p>Primarily specializing in ESP32 projects, and I have made some PCBs as well. I also like making websites. I am not technically full stack, but I am pretty good with Firebase.</p>
                    </div>
                    <div class="about-section">
                        <h3>MY INTERESTS</h3>
                        <p>Video games, programming, music, flute, video games, soccer, biking, and video games.</p>
                    </div>
                </div>
            `;
        });
    }

    showProjects() {
        if (!this._projects) {
            this._projects = [
                {
                    title: 'Sunhaven Module',
                    desc: 'A net-zero, passobely heated/cooled 3D-printed housing unit to fight energy poverty. Awarded 1st prize in Autodesk Make it Real Architecture contest 2025, and autodesk construction scholorship.',
                    link: 'https://www.instructables.com/SunHaven-Module-an-Affordable-Net-Zero-Passively-H/',
                    techs: ['Revit', 'Fusion360']
                },
                {
                    title: 'Wireless Mini Network Operating Center',
                    desc: 'Simple web based wifi health checker and logger made using ESP32 C3 Supermini and TFT screen with a 3D printed case.',
                    link: 'https://www.instructables.com/Solderless-Portable-Mini-Network-Operating-Center-/',
                    techs: ['Arduino IDE', 'ESP32C3 Supermini', 'TFT Screen']
                },
                {
                    title: 'AED for All Website',
                    desc: 'A website for a cofounded nonprofit dedicated to improving cardiac awarness in local community.',
                    link: 'https://aedforall.org/',
                    techs: ['HTML', 'CSS', 'JS']
                },
                {
                    title: 'Hexapod',
                    desc: 'Autodesk Annual Make it Temporary Student Architecture Contest 1st Place winning blueprint for a modular hexagonal housing unit with zipper tarpulin walls for easy linking.',
                    link: 'https://www.instructables.com/HexaPod-All-in-One-Modular-Interconnected-Living-S/',
                    techs: ['Fusion360', 'Blender']
                },
                {
                    title: 'The Robot Workshop',
                    desc: 'Autodesk Annual Make it Glow Student Visual Effects winning 3D rendering of a futuristic robot..',
                    link: 'https://www.instructables.com/The-Robot-Workshop/',
                    techs: ['Fusion360', 'Blender']
                }
            ];
        }

        this.createWindow('Projects', () => {
            let html = '<div class="projects-grid">';
            this._projects.forEach((project, idx) => {
                const techsHtml = (project.techs || []).map(t => `<span class="tech-tag">${t}</span>`).join('');
                html += `
                    <div class="project-card" data-index="${idx}">
                        <div class="project-title">${project.title}</div>
                        <div class="project-desc">${project.desc}</div>
                        <div class="project-techs">${techsHtml}</div>
                        <div class="project-actions">
                            <a class="project-link" href="${project.link}" target="_blank" rel="noopener noreferrer">View Project</a>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            return html;
        });
    }

    showSkills() {
        const skills = [
            { name: 'Web Dev (frontend)', level: 75 },
            { name: 'Web Dev (backend)', level: 60 },
            { name: 'Python', level: 30 },
            { name: 'Arduino IDE', level: 80 },
            { name: 'ESP32', level: 85 },
            { name: 'UI/UX Design', level: 55 }
        ];

        this.createWindow('Skills', () => {
            let html = '<div class="skills-container">';
            skills.forEach(skill => {
                html += `
                    <div class="skill-item">
                        <div class="skill-name">${skill.name}</div>
                        <div class="skill-bar-container">
                            <div class="skill-bar" style="width: ${skill.level}%">
                                <span class="skill-percentage">${skill.level}%</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            return html;
        });
    }

    showContact() {
        this.createWindow('Contact', () => {
            return `
                <div class="contact-links">
                    <ul class="contact-list">
                        <li><a href="https://github.com/I-s-h-a-n-C" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                        <li><a href="mailto:chackris.ish@gmail.com">Email</a></li>
                        <li><a href="https://www.instructables.com/member/avidgamer/" target="_blank" rel="noopener noreferrer">Instructables</a></li>
                        <li><a href="https://www.youtube.com/@iseecircuits" target="_blank" rel="noopener noreferrer">YouTube</a></li>
                        <li><a href="#" target="_blank" rel="noopener noreferrer">Riv on Slack</a></li>
                    </ul>
                </div>
            `;
        });
    }

    showquote() {
        const quotes = [
        "My code works. I just don’t actually know why. - me",
        "I don’t actually fix bugs. I just make new features that hide them. - me",
        "I don’t have errors. - me",
        "If my code compiles on the first try, something is wrong with Arduino IDE. - me",
        "I don’t delete code. - me",
        "My code isn’t slow. - me",
        "That wasn't me - me",
        "Thats a feature not a bug. - me",
        ];

        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        
        this.createWindow('quote', () => {
            return `<div class="quote-quote">${quote}</div>`;
        });
    }

    surprise() {
        this.addOutputLine('I wonder what this does', 'info-text');
        
        setTimeout(() => {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        }, 2000);
    }

    startneo() {
        const neoContainer = document.createElement('div');
        neoContainer.className = 'neo-container';
        neoContainer.id = 'neoContainer';
        document.body.appendChild(neoContainer);

        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const columns = Math.floor(window.innerWidth / 20);
        
        for (let i = 0; i < columns; i++) {
            const column = document.createElement('div');
            column.className = 'neo-column';
            column.style.left = `${i * 20}px`;
            column.style.animationDuration = `${Math.random() * 3 + 2}s`;
            column.style.opacity = Math.random() * 0.5 + 0.5;
            
            let text = '';
            for (let j = 0; j < 30; j++) {
                text += chars[Math.floor(Math.random() * chars.length)] + '<br>';
            }
            column.innerHTML = text;
            
            neoContainer.appendChild(column);
        }

        this.addOutputLine('These are real words I promise', 'info-text');

        setTimeout(() => {
            this.stopneo();
        }, 8000);
    }

    stopneo() {
        const neoContainer = document.getElementById('neoContainer');
        if (neoContainer) {
            neoContainer.remove();
        }
    }

    clearTerminal() {
        this.terminalOutput.innerHTML = '';
        const neoContainer = document.getElementById('neoContainer');
        if (neoContainer) {
            neoContainer.remove();
        }
    }

    switchColorScheme(scheme, silent = false) {
        const schemes = {
            'green': { primary: '#00ff88', secondary: '#ff6b9d', accent: '#4dd0e1' },
            'purple': { primary: '#b366ff', secondary: '#ff1493', accent: '#00ffff' },
            'blue': { primary: '#00ccff', secondary: '#ff00ff', accent: '#ffff00' },
            'orange': { primary: '#ff8800', secondary: '#00ffff', accent: '#ffff00' },
            'pink': { primary: '#ff1493', secondary: '#00ff88', accent: '#ffff00' }
        };

        if (!schemes[scheme]) {
            if (!silent) this.addOutputLine(`Unknown color scheme: ${scheme}. Available: green, purple, blue, orange, pink`, 'error-text');
            return;
        }

        this.colorScheme = scheme;
        const colors = schemes[scheme];
        const root = document.documentElement;
        root.style.setProperty('--neon-green', colors.primary);
        root.style.setProperty('--neon-pink', colors.secondary);
        root.style.setProperty('--neon-cyan', colors.accent);

        try { localStorage.setItem('rivs_colorScheme', scheme); } catch (e) {}

        if (!silent) this.addOutputLine(`Color scheme changed to "${scheme}"`, 'success-text');
    }

    showColorOptions() {
        this.addOutputLine('Usage: color [scheme]', 'info-text');
        this.addOutputLine('Available schemes: green, purple, blue, orange, pink', 'info-text');
    }

    switchTheme(theme, silent = false) {
        const themes = {
            'default': { bg: 'transparent', text: '#00ff88' },
            'amber': { bg: '#1a1a0a', text: '#ffb000' },
            'monochrome': { bg: '#0f0f0f', text: '#cccccc' },
            'ms dos': { bg: '#0000aa', text: '#00ff00' }
        };

        // this should make it easier
        try {
            themes['dos'] = themes['ms dos'];
            themes['msdos'] = themes['ms dos'];
            themes['ms-dos'] = themes['ms dos'];
        } catch (e) {}

        if (!themes[theme]) {
            if (!silent) this.addOutputLine(`Unknown theme: ${theme}. Available: default, amber, monochrome, ms dos`, 'error-text');
            return;
        }

        this.terminalTheme = theme;
        const themeColors = themes[theme];
        const container = document.getElementById('terminalContainer');
        
        if (container) {
            if (theme === 'default') {
                container.style.backgroundColor = '';
            } else {
                container.style.backgroundColor = themeColors.bg;
            }
            container.style.color = themeColors.text;
            document.querySelectorAll('.terminal-line').forEach(line => {
                if (!line.classList.contains('error-text')) {
                    line.style.color = themeColors.text;
                }
            });
        }

        try { localStorage.setItem('rivs_theme', theme); } catch (e) {}

        if (!silent) this.addOutputLine(`Terminal theme changed to "${theme}"`, 'success-text');
    }

    showThemeOptions() {
        this.addOutputLine('Usage: theme [name]', 'info-text');
        this.addOutputLine('Available themes: default, amber, monochrome, ms dos', 'info-text');
    }


    formatTitleAsFile(title) {
        try {
            const t = String(title || 'file').trim();
            const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const lower = t.toLowerCase();
            let ext = '.exe';
            if (lower.includes('snake') || lower.includes('pong') || lower.includes('.rom') || lower.includes('game')) {
                ext = '.rom';
            } else if (lower.includes('about') || lower === 'about me' || slug === 'about-me') {
                ext = '.txt';
            } else {
                ext = '.exe';
            }
            return `${slug}${ext}`;
        } catch (e) {
            return title;
        }
    }

    startSnakeGame() {
        this.createWindow('Snake', () => {
            return `<div class="game-container"><canvas id="snakeCanvas" width="400" height="400" tabindex="0" style="outline:none;"></canvas><div class="game-instructions">Use arrow keys to move. Close window to stop.</div></div>`;
        }, () => {
            const canvas = document.getElementById('snakeCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const size = 20;
            const cols = Math.floor(canvas.width / size);
            const rows = Math.floor(canvas.height / size);

            let snake = [{ x: Math.floor(cols/2), y: Math.floor(rows/2) }];
            let dir = { x: 0, y: 0 };
            let food = null;
            let running = true;

            const placeFood = () => {
                while (true) {
                    const fx = Math.floor(Math.random() * cols);
                    const fy = Math.floor(Math.random() * rows);
                    if (!snake.some(s => s.x === fx && s.y === fy)) {
                        food = { x: fx, y: fy };
                        break;
                    }
                }
            };

            const keyHandler = (e) => {
                if (e.key === 'ArrowUp' && dir.y === 0) { dir = { x: 0, y: -1 }; }
                if (e.key === 'ArrowDown' && dir.y === 0) { dir = { x: 0, y: 1 }; }
                if (e.key === 'ArrowLeft' && dir.x === 0) { dir = { x: -1, y: 0 }; }
                if (e.key === 'ArrowRight' && dir.x === 0) { dir = { x: 1, y: 0 }; }
            };

            placeFood();
            canvas.focus();
            canvas.addEventListener('keydown', keyHandler);

            let last = 0;
            const speed = 8;

            const frame = (t) => {
                if (!running) return;
                if (!document.body.contains(canvas)) { running = false; canvas.removeEventListener('keydown', keyHandler); return; }
                if (t - last < 1000 / speed) { requestAnimationFrame(frame); return; }
                last = t;

                if (dir.x !== 0 || dir.y !== 0) {
                    const head = { x: (snake[0].x + dir.x + cols) % cols, y: (snake[0].y + dir.y + rows) % rows };
                    if (snake.some(s => s.x === head.x && s.y === head.y)) {
                        this.addOutputLine('Snake game: Game Over', 'error-text');
                        running = false;
                        canvas.removeEventListener('keydown', keyHandler);
                        return;
                    }
                    snake.unshift(head);
                    if (food && head.x === food.x && head.y === food.y) {
                        placeFood();
                    } else {
                        snake.pop();
                    }
                }

                ctx.fillStyle = '#000';
                ctx.fillRect(0,0,canvas.width,canvas.height);
                if (food) {
                    ctx.fillStyle = '#ff3';
                    ctx.fillRect(food.x*size, food.y*size, size, size);
                }
                ctx.fillStyle = '#0f0';
                snake.forEach((s, i) => {
                    ctx.fillStyle = i===0 ? '#0ff' : '#0f0';
                    ctx.fillRect(s.x*size+1, s.y*size+1, size-2, size-2);
                });

                requestAnimationFrame(frame);
            };

            requestAnimationFrame(frame);
        });
    }

    startPongGame() {
        this.createWindow('Pong', () => {
            return `<div class="game-container"><canvas id="pongCanvas" width="500" height="300" tabindex="0" style="outline:none;"></canvas><div class="game-instructions">W/S or ArrowUp/Down to move. First to 5 wins. Close window to stop.</div></div>`;
        }, () => {
            const canvas = document.getElementById('pongCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const pw = 10, ph = 60;
            const ballSize = 8;
            let playerY = (canvas.height - ph) / 2;
            let aiY = (canvas.height - ph) / 2;
            let ball = { x: canvas.width/2, y: canvas.height/2, vx: 4*(Math.random()>0.5?1:-1), vy: 2*(Math.random()>0.5?1:-1) };
            let playerScore = 0, aiScore = 0;
            let running = true;

            const keyState = {};
            const keyHandler = (e) => { if (e.type === 'keydown') keyState[e.key] = true; else keyState[e.key] = false; };
            window.addEventListener('keydown', keyHandler); window.addEventListener('keyup', keyHandler);
            canvas.focus();

            const step = () => {
                if (!running) return;
                if (!document.body.contains(canvas)) { running = false; window.removeEventListener('keydown', keyHandler); window.removeEventListener('keyup', keyHandler); return; }
                if (keyState['w'] || keyState['ArrowUp']) playerY -= 6;
                if (keyState['s'] || keyState['ArrowDown']) playerY += 6;
                playerY = Math.max(0, Math.min(canvas.height - ph, playerY));

                const centerAI = aiY + ph/2;
                if (centerAI < ball.y - 10) aiY += 4; else if (centerAI > ball.y + 10) aiY -= 4;
                aiY = Math.max(0, Math.min(canvas.height - ph, aiY));

                ball.x += ball.vx; ball.y += ball.vy;
                if (ball.y <= 0 || ball.y >= canvas.height - ballSize) ball.vy *= -1;

                if (ball.x <= pw && ball.y + ballSize >= playerY && ball.y <= playerY + ph) { ball.vx = Math.abs(ball.vx); ball.vx *= 1.05; }
                if (ball.x + ballSize >= canvas.width - pw && ball.y + ballSize >= aiY && ball.y <= aiY + ph) { ball.vx = -Math.abs(ball.vx); ball.vx *= 1.03; }

                if (ball.x < -50) { aiScore++; ball.x = canvas.width/2; ball.y = canvas.height/2; ball.vx = 4; ball.vy = 2*(Math.random()>0.5?1:-1); }
                if (ball.x > canvas.width + 50) { playerScore++; ball.x = canvas.width/2; ball.y = canvas.height/2; ball.vx = -4; ball.vy = 2*(Math.random()>0.5?1:-1); }

                ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
                ctx.fillStyle = '#444'; for (let y=0;y<canvas.height;y+=20) ctx.fillRect(canvas.width/2-1, y, 2, 10);
                ctx.fillStyle = '#0f0'; ctx.fillRect(0, playerY, pw, ph);
                ctx.fillStyle = '#f00'; ctx.fillRect(canvas.width-pw, aiY, pw, ph);
                ctx.fillStyle = '#fff'; ctx.fillRect(ball.x, ball.y, ballSize, ballSize);
                ctx.fillStyle = '#fff'; ctx.font = '20px monospace'; ctx.fillText(playerScore, canvas.width/2 - 40, 30); ctx.fillText(aiScore, canvas.width/2 + 20, 30);

                if (playerScore >= 5 || aiScore >= 5) {
                    running = false;
                    const winner = playerScore >=5 ? 'Player' : 'Terminal';
                    this.addOutputLine(`Pong finished: ${winner} wins (${playerScore}-${aiScore})`, 'success-text');
                    window.removeEventListener('keydown', keyHandler); window.removeEventListener('keyup', keyHandler);
                    return;
                }

                requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
        });
    }

    createWindow(title, contentGenerator, onMount = null, options = {}) {
        const windowId = `window-${Date.now()}`;
        const window = document.createElement('div');
        window.className = 'retro-window';
        window.id = windowId;
        window.style.zIndex = ++this.windowZIndex;
        
        const maxX = window.innerWidth - 600;
        const maxY = window.innerHeight - 400;
        const initialLeft = Math.max(50, Math.min(Math.random() * Math.max(0, maxX) + 50, maxX));
        const initialTop = Math.max(50, Math.min(Math.random() * Math.max(0, maxY) + 50, maxY));
        window.style.position = 'absolute';
        window.style.left = `${initialLeft}px`;
        window.style.top = `${initialTop}px`;

        window.innerHTML = `
            <div class="window-header">
                <span class="window-title">${title}</span>
                <div class="window-controls">
                    <div class="window-btn minimize" title="Minimize"></div>
                    <div class="window-btn maximize" title="Maximize"></div>
                    <div class="window-btn close" title="Close"></div>
                </div>
            </div>
            <div class="window-content">
                ${contentGenerator()}
            </div>
        `;

        this.windowsContainer.appendChild(window);
        this.windows.push(window);

        // Display the window title as a playful filename (e.g. help.txt, about-me.pdf)
        try {
            const titleEl = window.querySelector('.window-title');
            if (titleEl) {
                const fileTitle = this.formatTitleAsFile(title);
                titleEl.textContent = fileTitle;
                window.dataset.fileName = fileTitle;
            }
        } catch (e) {}

        this.focusWindow(window);

        this.makeDraggable(window);

        const closeBtn = window.querySelector('.window-btn.close');
        const minimizeBtn = window.querySelector('.window-btn.minimize');
        const maximizeBtn = window.querySelector('.window-btn.maximize');

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(window);
        });

        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimizeWindow(window);
        });

        maximizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.maximizeWindow(window);
        });

        if (onMount) {
            setTimeout(() => onMount(), 0);
        }

        if (!options.skipAutoWarning) {
            setTimeout(() => this.maybeShowTooManyWindowsWarning(), 10);
        }

        return window;
    }

    maybeShowTooManyWindowsWarning() {
        const existing = this.windowsContainer.querySelector('.retro-window.transient-warning');
        const userWindowCount = this.windows.filter(w => !w.classList.contains('transient-warning')).length;

        if (userWindowCount > 2 && !existing) {
            const warningWindow = this.createWindow('Are you gonna close some of those?', () => {
                return `<div class="warning-content">It doesn't really matter or anything but still</div>`;
            }, null, { skipAutoWarning: true });

            warningWindow.classList.add('transient-warning');

            setTimeout(() => {
                try {
                    const w = warningWindow.offsetWidth || 360;
                    warningWindow.style.left = `${Math.max(20, (window.innerWidth - w) / 2)}px`;
                    warningWindow.style.top = `80px`;
                } catch (e) {
                }
            }, 0);

            setTimeout(() => {
                this.closeWindow(warningWindow);
            }, 5000);
        }
    }

    makeDraggable(windowElement) {
        const header = windowElement.querySelector('.window-header');
        const content = windowElement.querySelector('.window-content');
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        const getPosition = () => {
            const rect = windowElement.getBoundingClientRect();
            return { x: rect.left, y: rect.top };
        };

        const isInteractiveElement = (element) => {
            if (!element) return false;
            const tagName = element.tagName.toLowerCase();
            const interactiveTags = ['input', 'textarea', 'button', 'a', 'select'];
            if (interactiveTags.includes(tagName)) return true;
            if (element.closest('input, textarea, button, select')) return true;
            return false;
        };

        const startDrag = (e) => {
            if (e.target && e.target.classList.contains('window-btn')) return;
            if (isInteractiveElement(e.target)) return;
            if (e.target && e.target.tagName === 'LABEL') return;
            
            isDragging = true;
            this.focusWindow(windowElement);
            
            const pos = getPosition();
            initialX = pos.x;
            initialY = pos.y;
            startX = e.clientX;
            startY = e.clientY;
            
            windowElement.style.transition = 'none';
            windowElement.style.cursor = 'grabbing';
            windowElement.classList.add('dragging');
            document.body.style.userSelect = 'none';
            
            e.preventDefault();
            e.stopPropagation();
        };

        const drag = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newX = initialX + deltaX;
            let newY = initialY + deltaY;
            
            const maxX = window.innerWidth - windowElement.offsetWidth;
            const maxY = window.innerHeight - windowElement.offsetHeight;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            windowElement.style.left = `${newX}px`;
            windowElement.style.top = `${newY}px`;
        };

        const stopDrag = () => {
            if (isDragging) {
                isDragging = false;
                windowElement.style.transition = '';
                windowElement.style.cursor = '';
                windowElement.classList.remove('dragging');
                document.body.style.userSelect = '';
            }
        };

        header.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('window-btn')) {
                startDrag(e);
            }
        });
        
        content.addEventListener('mousedown', (e) => {
            if (!isInteractiveElement(e.target) && e.target.tagName !== 'LABEL') {
                startDrag(e);
            }
        });

        const handleTouchStart = (e) => {
            if (e.target.classList.contains('window-btn')) return;
            if (isInteractiveElement(e.target)) return;
            if (e.target.tagName === 'LABEL') return;
            
            const touch = e.touches[0];
            startDrag({
                clientX: touch.clientX,
                clientY: touch.clientY,
                target: e.target,
                preventDefault: () => e.preventDefault(),
                stopPropagation: () => e.stopPropagation()
            });
        };

        header.addEventListener('touchstart', handleTouchStart, { passive: false });
        content.addEventListener('touchstart', handleTouchStart, { passive: false });

        document.addEventListener('mousemove', drag, true);
        document.addEventListener('mouseup', stopDrag, true);
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                drag({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                e.preventDefault();
            }
        }, { passive: false });
        document.addEventListener('touchend', stopDrag, true);
    }

    focusWindow(window) {
        this.windows.forEach(w => w.classList.remove('focused'));
        window.classList.add('focused');
        window.style.zIndex = ++this.windowZIndex;
        this.currentWindow = window;
    }

    closeWindow(window) {
        window.style.animation = 'windowFadeIn 0.3s ease-out reverse';
        setTimeout(() => {
            window.remove();
            this.windows = this.windows.filter(w => w !== window);
        }, 300);
    }

    minimizeWindow(window) {
        const title = window.querySelector('.window-title').textContent;
        const isMinimized = window.dataset.minimized === 'true';
        
        if (isMinimized) {
            window.dataset.minimized = 'false';
            window.style.display = 'flex';
            this.focusWindow(window);
            this.removeFromTaskbar(window.id);
        } else {
            window.dataset.minimized = 'true';
            window.style.display = 'none';
            this.addToTaskbar(window.id, title);
        }
    }

    addToTaskbar(windowId, title) {
        const taskbar = document.getElementById('taskbar');
        if (!taskbar) return;

        if (document.getElementById(`taskbar-btn-${windowId}`)) return;

        const btn = document.createElement('button');
        btn.id = `taskbar-btn-${windowId}`;
        btn.className = 'taskbar-btn';
        // show a small icon instead of the full text label for minimized windows
        try {
            const icon = this.getIconForTitle(title || 'file');
            btn.innerHTML = `<span class="taskbar-icon" aria-hidden="true">${icon}</span>`;
            btn.setAttribute('aria-label', title || 'window');
            btn.title = title || '';
        } catch (e) {
            btn.textContent = title;
        }
        btn.addEventListener('click', () => {
            const window = document.getElementById(windowId);
            if (window) {
                window.dataset.minimized = 'false';
                window.style.display = 'flex';
                this.focusWindow(window);
                this.removeFromTaskbar(windowId);
            }
        });

        taskbar.appendChild(btn);
        this.minimizedWindows.push(windowId);
    }

    getIconForTitle(title) {
        try {
            const t = (title || '').toLowerCase();
            const svgs = {
                game: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="10" rx="3" fill="currentColor"/><circle cx="8" cy="12" r="1.6" fill="#000"/><circle cx="12" cy="12" r="1.6" fill="#000"/><rect x="16" y="10" width="1.6" height="1.6" fill="#000"/><rect x="18.4" y="10" width="1.6" height="1.6" fill="#000"/></svg>`,
                doc: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="currentColor"/><path d="M13 3v5h5" fill="#000"/></svg>`,
                folder: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" fill="currentColor"/></svg>`,
                help: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" fill="currentColor"/><path d="M9.5 9.5a2.5 2.5 0 1 1 5 1c0 1.5-1.5 2-2 2" stroke="#000" stroke-width="0.8" fill="none"/><circle cx="12" cy="17" r="0.8" fill="#000"/></svg>`,
                envelope: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 6v12h20V6" fill="currentColor"/><path d="M22 6l-10 7L2 6" fill="#000"/></svg>`,
                terminal: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor"/><path d="M8 9l3 3-3 3" stroke="#000" stroke-width="1.2" fill="none"/><path d="M14 15h4" stroke="#000" stroke-width="1.2" fill="none"/></svg>`,
                quote: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 7h4v4H7zM13 7h4v4h-4z" fill="currentColor"/></svg>`,
                gear: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="currentColor"/><path d="M2 12a10 10 0 0 0 20 0 10 10 0 0 0-20 0z" fill-opacity="0" stroke="#000" stroke-width="0.8"/></svg>`,
                box: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 7l9 5 9-5v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" fill="currentColor"/></svg>`
            };

            if (t.includes('.rom') || t.includes('snake') || t.includes('pong') || t.includes('game')) return svgs.game;
            if (t.includes('about') || t.includes('readme') || t.includes('.txt')) return svgs.doc;
            if (t.includes('help') || t.includes('faq')) return svgs.help;
            if (t.includes('project')) return svgs.folder;
            if (t.includes('skills') || t.includes('skill')) return svgs.gear;
            if (t.includes('contact') || t.includes('email')) return svgs.envelope;
            if (t.includes('neo') || t.includes('matrix')) return svgs.box;
            if (t.includes('quote')) return svgs.quote;
            if (t.includes('terminal') || t.includes('sudo')) return svgs.terminal;
            return svgs.box;
        } catch (e) { return '📦'; }
    }

    removeFromTaskbar(windowId) {
        const btn = document.getElementById(`taskbar-btn-${windowId}`);
        if (btn) btn.remove();
        this.minimizedWindows = this.minimizedWindows.filter(id => id !== windowId);
    }

    maximizeWindow(window) {
        if (window.style.width === '95vw') {
            window.style.width = '600px';
            window.style.height = 'auto';
            window.style.left = '';
            window.style.top = '';
        } else {
            window.style.width = '95vw';
            window.style.height = '90vh';
            window.style.left = '2.5vw';
            window.style.top = '5vh';
        }
    }

    cycleWindows() {
        if (this.windows.length === 0) return;
        
        const currentIndex = this.windows.indexOf(this.currentWindow);
        const nextIndex = (currentIndex + 1) % this.windows.length;
        this.focusWindow(this.windows[nextIndex]);
    }

}

function startBootSequence(onComplete) {
    try {
        const terminalOutput = document.getElementById('terminalOutput');

        const messages = [
            "Preparing package ...",
            "Installing package..."
        ];

        const typeIntoElement = (el, text, charDelay = 18, cb) => {
            let i = 0;
            const tick = () => {
                if (i < text.length) {
                    el.innerHTML += text[i++];
                    if (terminalOutput) terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    setTimeout(tick, charDelay);
                } else {
                    if (typeof cb === 'function') cb();
                }
            };
            tick();
        };

        let idx = 0;

        const next = () => {
            if (idx >= messages.length) {
                setTimeout(() => { if (typeof onComplete === 'function') onComplete(); }, 200);
                return;
            }

            const msg = messages[idx];

            if (terminalOutput) {
                const line = document.createElement('div');
                line.className = 'terminal-line boot-line';
                terminalOutput.appendChild(line);

                if (idx === 1) {
                    typeIntoElement(line, msg + ': ', 14, () => {
                        const steps = Math.floor(Math.random() * 4) + 3;
                        let step = 0;

                        const progressNext = () => {
                            if (step >= steps) {
                                const okLine = document.createElement('div');
                                okLine.className = 'terminal-line boot-divider';
                                okLine.textContent = 'Done.';
                                terminalOutput.appendChild(okLine);
                                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                                try {
                                    const inputEl = document.getElementById('terminalInput');
                                    if (inputEl && typeof inputEl.scrollIntoView === 'function') {
                                        inputEl.scrollIntoView({ block: 'end', inline: 'nearest' });
                                    }
                                } catch (e) {}
                                idx++;
                                setTimeout(next, 120);
                                return;
                            }

                            const progressLine = document.createElement('div');
                            progressLine.className = 'terminal-line boot-progress';
                            const percent = Math.min(99, Math.round(((step + 1) / steps) * 100));
                            const randBetween = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
                            let eqCount;
                            if (percent <= 20) {
                                eqCount = randBetween(6, 8);
                            } else if (percent <= 40) {
                                eqCount = randBetween(9, 12);
                            } else if (percent <= 60) {
                                eqCount = randBetween(13, 18);
                            } else if (percent <= 80) {
                                eqCount = randBetween(19, 26);
                            } else {
                                eqCount = randBetween(27, 36);
                            }
                            const eqs = '='.repeat(eqCount);
                            progressLine.textContent = `${eqs} ${percent}%`;
                            terminalOutput.appendChild(progressLine);
                            terminalOutput.scrollTop = terminalOutput.scrollHeight;
                            try {
                                const inputEl = document.getElementById('terminalInput');
                                if (inputEl && typeof inputEl.scrollIntoView === 'function') {
                                    inputEl.scrollIntoView({ block: 'end', inline: 'nearest' });
                                }
                            } catch (e) {}

                            const delayBetween = 80 + Math.floor(Math.random() * 140);
                            step++;
                            setTimeout(progressNext, delayBetween);
                        };

                        setTimeout(progressNext, 120);
                    });
                } else {
                    typeIntoElement(line, msg, 18, () => {
                        const divLine = document.createElement('div');
                        divLine.className = 'terminal-line boot-divider';
                        divLine.textContent = '='.repeat(Math.floor(Math.random() * 6) + 3);
                        terminalOutput.appendChild(divLine);
                        terminalOutput.scrollTop = terminalOutput.scrollHeight;
                        try {
                            const inputEl = document.getElementById('terminalInput');
                            if (inputEl && typeof inputEl.scrollIntoView === 'function') {
                                inputEl.scrollIntoView({ block: 'end', inline: 'nearest' });
                            }
                        } catch (e) {}
                        idx++;
                        setTimeout(next, 140);
                    });
                }
            } else {
                const containerId = 'boot-sequence-container';
                let container = document.getElementById(containerId);
                if (!container) {
                    container = document.createElement('div');
                    container.id = containerId;
                    container.style.position = 'fixed';
                    container.style.top = '40%';
                    container.style.left = '50%';
                    container.style.transform = 'translate(-50%, -50%)';
                    container.style.zIndex = '3000';
                    container.style.pointerEvents = 'none';
                    container.style.fontFamily = "'VT323', monospace";
                    container.style.color = 'var(--neon-green)';
                    container.style.fontSize = '18px';
                    container.style.textAlign = 'center';
                    document.body.appendChild(container);
                }

                container.textContent = '';
                typeIntoElement(container, msg, 18, () => {
                    const divider = '='.repeat(Math.floor(Math.random() * 6) + 3);
                    const div = document.createElement('div');
                    div.textContent = divider;
                    container.appendChild(div);
                    idx++;
                    setTimeout(next, 120);
                });
            }
        };

        next();
    } catch (e) {
        if (typeof onComplete === 'function') onComplete();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const asciiEl = document.querySelector('.terminal-line.ascii-art');
        const asciiModal = document.getElementById('asciiModal');
        const isMobileOrNarrow = () => {
            try {
                const ua = navigator.userAgent || '';
                return window.innerWidth < 800 || /Mobi|Android|iPhone|iPad|iPod/i.test(ua) || ('ontouchstart' in window);
            } catch (e) {
                return false;
            }
        };

        const applyAsciiFallback = () => {
            try {
                if (isMobileOrNarrow()) {
                    if (asciiEl) asciiEl.innerHTML = '<div class="plain-title">Riv\'s Portfolio</div>';
                    if (asciiModal) {
                        asciiModal.classList.remove('visible');
                        asciiModal.setAttribute('aria-hidden', 'true');
                    }
                }
            } catch (e) {}
        };

        applyAsciiFallback();

        window.addEventListener('resize', () => {
            try { applyAsciiFallback(); } catch (e) {}
        }, { passive: true });

        if (asciiModal) {
            if (isMobileOrNarrow()) {
                startBootSequence(() => new RetroTerminal());
            } else {
                asciiModal.classList.add('visible');
                asciiModal.setAttribute('aria-hidden', 'false');

                const hideBtn = asciiModal.querySelector('.modal-btn-hide');
                const keepBtn = asciiModal.querySelector('.modal-btn-keep');

                const closeAsciiModal = () => {
                    asciiModal.classList.remove('visible');
                    asciiModal.setAttribute('aria-hidden', 'true');
                    startBootSequence(() => new RetroTerminal());
                };

                if (hideBtn) hideBtn.addEventListener('click', () => {
                    if (asciiEl) asciiEl.innerHTML = '<div class="plain-title">Riv\'s Portfolio</div>';
                    closeAsciiModal();
                });

                if (keepBtn) keepBtn.addEventListener('click', () => {
                    closeAsciiModal();
                });
            }
        } else {
            startBootSequence(() => new RetroTerminal());
        }
    } catch (e) {
        startBootSequence(() => new RetroTerminal());
    }
});

const line = document.querySelector('.horizontal-sweep-line');

function restartAnimation() {
    line.style.animation = 'none';
    line.offsetHeight;
    line.style.animation = 'sweepDown 6s linear forwards';
    
    setTimeout(() => {
        line.style.animationDelay = '0s';
        restartAnimation();
    }, 11000);
}

restartAnimation();