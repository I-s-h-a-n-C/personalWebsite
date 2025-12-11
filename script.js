// App Registry - All apps are registered here
const APP_REGISTRY = {
    terminal: { name: 'Terminal', icon: 'assets/icon-terminal.svg', category: 'System' },
    files: { name: 'Files', icon: 'assets/icon-folder.svg', category: 'System' },
    help: { name: 'Help', icon: 'assets/icon-help.svg', category: 'System' },
    about: { name: 'About', icon: 'assets/icon-about.svg', category: 'Info' },
    projects: { name: 'Projects', icon: 'assets/icon-projects.svg', category: 'Info' },
    skills: { name: 'Skills', icon: 'assets/icon-skills.svg', category: 'Info' },
    contact: { name: 'Contact', icon: 'assets/icon-contact.svg', category: 'Info' },
    system: { name: 'System Monitor', icon: 'assets/icon-system.svg', category: 'System' },
    snake: { name: 'Snake', icon: 'assets/icon-snake.svg', category: 'Games' },
    pong: { name: 'Pong', icon: 'assets/icon-pong.svg', category: 'Games' },
    quote: { name: 'Quote', icon: 'assets/icon-quote.svg', category: 'Fun' },
    surprise: { name: 'Surprise', icon: 'assets/icon-surprise.svg', category: 'Fun' },
    neo: { name: 'Matrix', icon: 'assets/icon-neo.svg', category: 'Fun' },
};

class RetroTerminal {
    constructor(container) {
        this.container = container;
        this.terminalInput = container.querySelector('.terminal-input');
        this.terminalOutput = container.querySelector('.terminal-output');
        this.commandHistory = [];
        this.historyIndex = -1;
        this.typingSpeed = 30;
        this.allCommands = ['help', 'about', 'projects', 'skills', 'contact', 'quote', 'surprise', 'neo', 'color', 'theme', 'clear', 'exit', 'quit', 'snake', 'pong', 'files', 'system'];
        
        this.init();
    }

    init() {
        this.terminalInput.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.terminalInput.addEventListener('input', () => this.updateCursor());
        
        // Focus on click
        this.container.addEventListener('click', () => {
            this.terminalInput.focus();
        });
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.processCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory(1);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autocompleteCommand();
        }
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

    navigateHistory(dir) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += dir;
        if (this.historyIndex < 0) this.historyIndex = -1;
        if (this.historyIndex >= this.commandHistory.length) this.historyIndex = this.commandHistory.length - 1;
        
        if (this.historyIndex >= 0) {
            this.terminalInput.value = this.commandHistory[this.historyIndex];
        } else {
            this.terminalInput.value = '';
        }
    }

    processCommand() {
        const command = this.terminalInput.value.trim().toLowerCase();
        if (command === '') { 
            this.addOutputLine('', 'prompt'); 
            return; 
        }
        this.commandHistory.push(command); 
        this.historyIndex = -1;
        this.addOutputLine(`sudo@rivsportfolio:~$ ${command}`, 'prompt');
        this.executeCommand(command);
        this.terminalInput.value = ''; 
        this.terminalInput.focus();
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
            case 'files':
                this.showFiles();
                break;
            case 'system':
                this.showSystem();
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
                    this.switchTheme(args[0]);
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
                this.addOutputLine('Use the close button to exit the terminal.', 'info-text');
                break;
            default:
                this.addOutputLine(`${cmd}: command not found. Type 'help' for available commands.`, 'error-text');
        }
    }

    addOutputLine(text, className = '') {
        const line = document.createElement('div'); 
        line.className = `terminal-line ${className}`; 
        this.terminalOutput.appendChild(line);
        
        if (text === '') {
            line.innerHTML = '&nbsp;';
            return;
        }

        let charIndex = 0;
        const typeCharacter = () => {
            if (charIndex < text.length) {
                line.innerHTML += text[charIndex++];
                this.scrollToBottom();
                setTimeout(typeCharacter, this.typingSpeed);
            }
        };
        typeCharacter();
    }

    scrollToBottom() {
        try {
            this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
            const inputEl = this.terminalInput;
            if (inputEl && typeof inputEl.scrollIntoView === 'function') {
                inputEl.scrollIntoView({ block: 'end', inline: 'nearest' });
            }
        } catch (e) {}
    }

    clearTerminal() {
        this.terminalOutput.innerHTML = '';
    }

    showHelp() {
        const commands = [
            { name: 'help', desc: 'List all commands' },
            { name: 'about', desc: 'About me' },
            { name: 'projects', desc: 'My projects' },
            { name: 'skills', desc: 'Technical skills' },
            { name: 'contact', desc: 'Contact information' },
            { name: 'files', desc: 'Browse files' },
            { name: 'system', desc: 'System monitor' },
            { name: 'quote', desc: 'Random quotes' },
            { name: 'surprise', desc: '???' },
            { name: 'neo', desc: 'Matrix mode' },
            { name: 'color [scheme]', desc: 'Change color scheme' },
            { name: 'theme [name]', desc: 'Change terminal theme' },
            { name: 'clear', desc: 'Clear screen' },
            { name: 'snake', desc: 'Play Snake' },
            { name: 'pong', desc: 'Play Pong' },
        ];

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
    }

    showAbout() {
        return `
            <div class="about-content">
                <div class="about-section">
                    <h3>👤 WHO AM I?</h3>
                    <p>High school student & maker based in the US. I build things and solve problems.</p>
                </div>
                <div class="about-section">
                    <h3>🛠️ WHAT I DO</h3>
                    <p>ESP32 projects, PCB design, web development with Firebase. Not full-stack but getting there.</p>
                </div>
                <div class="about-section">
                    <h3>🎮 INTERESTS</h3>
                    <p>Video games, programming, music (flute), soccer, biking, and more video games.</p>
                </div>
            </div>
        `;
    }

    showProjects() {
        const projects = [
            {
                title: 'Sunhaven Module',
                desc: 'Net-zero 3D-printed housing unit. 1st place Autodesk 2025 contest winner.',
                link: 'https://www.instructables.com/SunHaven-Module-an-Affordable-Net-Zero-Passively-H/',
                techs: ['Revit', 'Fusion360']
            },
            {
                title: 'Mini Network Operating Center',
                desc: 'WiFi health checker using ESP32 C3 Supermini with TFT display.',
                link: 'https://www.instructables.com/Solderless-Portable-Mini-Network-Operating-Center-/',
                techs: ['Arduino', 'ESP32', 'TFT']
            },
            {
                title: 'AED for All Website',
                desc: 'Nonprofit website for improving cardiac awareness in the community.',
                link: 'https://aedforall.org/',
                techs: ['HTML', 'CSS', 'JS', 'Firebase']
            },
            {
                title: 'Hexapod',
                desc: 'Modular hexagonal housing unit. 1st place Autodesk architecture contest.',
                link: 'https://www.instructables.com/HexaPod-All-in-One-Modular-Interconnected-Living-S/',
                techs: ['Fusion360', 'Blender']
            },
            {
                title: 'Robot Workshop',
                desc: 'Futuristic robot 3D rendering. Autodesk Visual Effects contest winner.',
                link: 'https://www.instructables.com/The-Robot-Workshop/',
                techs: ['Fusion360', 'Blender']
            }
        ];

        let html = '<div class="projects-grid">';
        projects.forEach((project, idx) => {
            const techsHtml = (project.techs || []).map(t => `<span class="tech-tag">${t}</span>`).join('');
            html += `
                <div class="project-card" data-index="${idx}">
                    <div class="project-title">${project.title}</div>
                    <div class="project-desc">${project.desc}</div>
                    <div class="project-techs">${techsHtml}</div>
                    <div class="project-actions">
                        <a class="project-link" href="${project.link}" target="_blank">View Project →</a>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    showSkills() {
        const skills = [
            { name: 'Web Dev (Frontend)', level: 75 },
            { name: 'Web Dev (Backend)', level: 60 },
            { name: 'Python', level: 30 },
            { name: 'Arduino IDE', level: 80 },
            { name: 'ESP32/IoT', level: 85 },
            { name: 'UI/UX Design', level: 55 },
            { name: 'PCB Design', level: 65 },
        ];

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
    }

    showContact() {
        return `
            <div class="contact-links">
                <ul class="contact-list">
                    <li><a href="https://github.com/I-s-h-a-n-C" target="_blank">🐙 GitHub</a></li>
                    <li><a href="mailto:chackris.ish@gmail.com">📧 Email</a></li>
                    <li><a href="https://www.instructables.com/member/avidgamer/" target="_blank">📐 Instructables</a></li>
                    <li><a href="https://www.youtube.com/@iseecircuits" target="_blank">📺 YouTube</a></li>
                    <li><a href="#" onclick="showModal('Riv on Slack', 'Coming soon!')">💬 Slack</a></li>
                </ul>
            </div>
        `;
    }

    showFiles() {
        const files = [
            { name: 'projects/', type: 'folder' },
            { name: 'resume.pdf', type: 'pdf' },
            { name: 'cover_letter.doc', type: 'doc' },
            { name: 'portfolio.zip', type: 'zip' },
            { name: 'github_keys.txt', type: 'txt' },
        ];

        let html = '<div class="files-container"><div class="files-grid">';
        files.forEach(file => {
            const icon = file.type === 'folder' ? '📁' : '📄';
            html += `
                <div class="file-item" data-file="${file.name}">
                    <div class="file-icon">${icon}</div>
                    <div class="file-name">${file.name}</div>
                </div>
            `;
        });
        html += '</div></div>';
        return html;
    }

    showSystem() {
        const stats = [
            { label: 'CPU', value: 'ESP32-S3 @ 240MHz', usage: 67 },
            { label: 'Memory', value: '8GB RAM', usage: 45 },
            { label: 'Disk', value: '256GB SSD', usage: 78 },
            { label: 'Network', value: 'WiFi Connected', usage: 12 },
            { label: 'Uptime', value: '42 days, 7 hours', usage: null },
        ];

        let html = '<div class="system-container">';
        stats.forEach(stat => {
            html += `
                <div class="system-stat">
                    <div class="stat-header">
                        <span class="stat-label">${stat.label}</span>
                        <span class="stat-value">${stat.value}</span>
                    </div>
                    ${stat.usage !== null ? `
                        <div class="stat-bar-container">
                            <div class="stat-bar" style="width: ${stat.usage}%"></div>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    showquote() {
        const quotes = [
            '"My code works. I don\'t actually know why." - me',
            '"I don\'t fix bugs. I make new features that hide them." - me',
            '"That wasn\'t me." - me',
            '"It\'s a feature, not a bug." - me',
            '"If it compiles on first try, something is wrong." - me',
        ];

        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        return `<div class="quote-content">${quote}</div>`;
    }

    surprise() {
        setTimeout(() => {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        }, 1500);
        return '🎉 Opening surprise...';
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

        setTimeout(() => this.stopneo(), 8000);
        return 'Matrix mode activated for 8 seconds...';
    }

    stopneo() {
        const neoContainer = document.getElementById('neoContainer');
        if (neoContainer) {
            neoContainer.remove();
        }
    }

    startSnakeGame() {
        return `
            <div class="game-container">
                <canvas id="snakeCanvas" width="400" height="400" tabindex="0"></canvas>
                <div class="game-instructions">Use arrow keys to move. Close window to stop.</div>
            </div>
            <script>
                (function() {
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
                                running = false;
                                canvas.removeEventListener('keydown', keyHandler);
                                alert('Game Over! Score: ' + (snake.length - 1));
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
                })();
            <\/script>
        `;
    }

    startPongGame() {
        return `
            <div class="game-container">
                <canvas id="pongCanvas" width="500" height="300" tabindex="0"></canvas>
                <div class="game-instructions">W/S or ArrowUp/Down to move. First to 5 wins.</div>
            </div>
            <script>
                (function() {
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
                            alert('Pong finished: ${winner} wins (${playerScore}-${aiScore})');
                            window.removeEventListener('keydown', keyHandler); window.removeEventListener('keyup', keyHandler);
                            return;
                        }

                        requestAnimationFrame(step);
                    };

                    requestAnimationFrame(step);
                })();
            <\/script>
        `;
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
            if (!silent) this.addOutputLine(`Unknown scheme: ${scheme}. Available: ${Object.keys(schemes).join(', ')}`, 'error-text');
            return;
        }

        const colors = schemes[scheme];
        const root = document.documentElement;
        root.style.setProperty('--neon-green', colors.primary);
        root.style.setProperty('--neon-pink', colors.secondary);
        root.style.setProperty('--neon-cyan', colors.accent);

        try { localStorage.setItem('rivs_colorScheme', scheme); } catch (e) {}
        if (!silent) this.addOutputLine(`Color scheme: ${scheme}`, 'success-text');
    }

    showColorOptions() {
        this.addOutputLine('Usage: color [scheme]', 'info-text');
        this.addOutputLine('Schemes: green, purple, blue, orange, pink', 'info-text');
    }

    switchTheme(theme, silent = false) {
        const themes = {
            'default': { bg: 'transparent', text: '#00ff88' },
            'amber': { bg: '#1a1a0a', text: '#ffb000' },
            'monochrome': { bg: '#0f0f0f', text: '#cccccc' },
            'dos': { bg: '#0000aa', text: '#00ff00' }
        };

        if (!themes[theme]) {
            if (!silent) this.addOutputLine(`Unknown theme: ${theme}. Available: ${Object.keys(themes).join(', ')}`, 'error-text');
            return;
        }

        const themeColors = themes[theme];
        const container = this.container;
        
        if (container) {
            if (theme === 'default') {
                container.style.backgroundColor = '';
            } else {
                container.style.backgroundColor = themeColors.bg;
            }
            container.style.color = themeColors.text;
        }

        try { localStorage.setItem('rivs_theme', theme); } catch (e) {}
        if (!silent) this.addOutputLine(`Theme: ${theme}`, 'success-text');
    }

    showThemeOptions() {
        this.addOutputLine('Usage: theme [name]', 'info-text');
        this.addOutputLine('Themes: default, amber, monochrome, dos', 'info-text');
    }

    updateCursor() {
        // No-op: cursor is hidden in CSS
    }
}

class UbuntuDesktop {
    constructor() {
        this.windows = [];
        this.windowZIndex = 100;
        this.currentWindow = null;
        this.minimizedWindows = [];
        this.activeTerminals = new Map(); // Track terminals per window
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        this.setupLauncher();
        this.loadSettings();
    }

    setupEventListeners() {
        // Desktop icons (if present)
        const desktopIconsEl = document.getElementById('desktopIcons');
        if (desktopIconsEl) {
            desktopIconsEl.addEventListener('click', (e) => {
                const icon = e.target.closest('.desktop-icon');
                if (icon) {
                    const appName = icon.dataset.app;
                    if (appName) this.launchApp(appName);
                }
            });
        }

        // Dock icons
        document.getElementById('dock').addEventListener('click', (e) => {
            const icon = e.target.closest('.dock-icon');
            if (icon) {
                const appName = icon.dataset.app;
                if (appName) this.launchApp(appName);
            }
        });

        // Taskbar start button
        document.getElementById('taskbarStartBtn').addEventListener('click', () => {
            const launcher = document.getElementById('launcherMenu');
            const isHidden = launcher.getAttribute('aria-hidden') === 'true';
            launcher.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
        });

        // Launcher toggle
        document.getElementById('launcherBtn').addEventListener('click', () => {
            const launcher = document.getElementById('launcherMenu');
            const isHidden = launcher.getAttribute('aria-hidden') === 'true';
            launcher.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
        });

        // Close launcher when clicking outside
        document.addEventListener('click', (e) => {
            const launcher = document.getElementById('launcherMenu');
            if (!launcher.contains(e.target) && !e.target.closest('#launcherBtn') && !e.target.closest('#taskbarStartBtn')) {
                launcher.setAttribute('aria-hidden', 'true');
            }
        });

        // Alt+Tab window switching
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.cycleWindows();
            }
        });

        // Context menu prevention
        document.getElementById('windowsContainer').addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupLauncher() {
        const grid = document.getElementById('launcherGrid');
        const categories = {};

        // Group apps by category
        Object.entries(APP_REGISTRY).forEach(([key, app]) => {
            if (!categories[app.category]) categories[app.category] = [];
            categories[app.category].push({ key, ...app });
        });

        // Render categories
        Object.entries(categories).forEach(([category, apps]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'launcher-category';
            categoryDiv.innerHTML = `<h4>${category}</h4><div class="launcher-apps">`;
            
            apps.forEach(app => {
                const btn = document.createElement('button');
                btn.className = 'launcher-item';
                btn.dataset.app = app.key;
                btn.innerHTML = `
                    <img src="${app.icon}" alt="${app.name}">
                    <span>${app.name}</span>
                `;
                btn.addEventListener('click', () => {
                    this.launchApp(app.key);
                    document.getElementById('launcherMenu').setAttribute('aria-hidden', 'true');
                });
                categoryDiv.querySelector('.launcher-apps').appendChild(btn);
            });
            
            grid.appendChild(categoryDiv);
        });
    }

    launchApp(appName) {
        // Check if app is already open and not minimized
        const existingWindow = this.windows.find(w => w.dataset.app === appName && w.dataset.minimized !== 'true');
        if (existingWindow) {
            this.focusWindow(existingWindow);
            return;
        }

        // Launch the app
        const windowId = `window-${Date.now()}`;
        const window = this.createWindow(appName, APP_REGISTRY[appName]?.name || appName, windowId);
        window.dataset.app = appName;

        // Special handling for terminal (it needs an interactive instance)
        if (appName === 'terminal') {
            this.setupTerminalWindow(window);
        } else {
            // For other apps, render content into the window
            const contentEl = window.querySelector('.window-content');
            try {
                // Map app names to RetroTerminal display methods where applicable
                const map = {
                    help: 'showHelp',
                    about: 'showAbout',
                    projects: 'showProjects',
                    skills: 'showSkills',
                    contact: 'showContact',
                    files: 'showFiles',
                    system: 'showSystem',
                    quote: 'showquote'
                };

                if (map[appName] && typeof RetroTerminal.prototype[map[appName]] === 'function') {
                    const html = RetroTerminal.prototype[map[appName]].call(new RetroTerminalPlaceholder());
                    contentEl.innerHTML = html;
                } else if (appName === 'surprise') {
                    const msg = RetroTerminal.prototype.surprise.call(new RetroTerminalPlaceholder()) || 'Opening...';
                    contentEl.innerHTML = `<div class="centered">${msg}</div>`;
                } else if (appName === 'neo') {
                    const msg = RetroTerminal.prototype.startneo.call(new RetroTerminalPlaceholder()) || 'Matrix mode';
                    contentEl.innerHTML = `<div class="centered">${msg}</div>`;
                } else if (appName === 'snake') {
                    // create canvas and run snake game in this window
                    setupSnakeInElement(contentEl);
                } else if (appName === 'pong') {
                    setupPongInElement(contentEl);
                } else {
                    contentEl.innerHTML = `<div class="centered">No preview available for ${appName}</div>`;
                }
            } catch (e) {
                contentEl.innerHTML = `<div class="centered">Failed to open ${appName}</div>`;
            }
        }

        this.focusWindow(window);
    }


    setupTerminalWindow(window) {
        const container = window.querySelector('.terminal-container');
        const terminal = new RetroTerminal(container);
        
        // Store reference for potential cleanup
        this.activeTerminals.set(window.id, terminal);
        
        // Override the exit command behavior
        terminal.executeCommand = (command) => {
            const [cmd, ...args] = command.split(' ');
            if (cmd === 'exit' || cmd === 'quit') {
                this.closeWindow(window);
            } else {
                RetroTerminal.prototype.executeCommand.call(terminal, command);
            }
        };
    }

    createWindow(appName, title, windowId) {
        const window = document.createElement('div');
        window.className = 'retro-window';
        window.id = windowId;
        window.style.zIndex = ++this.windowZIndex;
        window.dataset.minimized = 'false';
        
        const maxX = window.innerWidth - 600;
        const maxY = window.innerHeight - 400;
        const initialLeft = Math.max(20, Math.min(Math.random() * Math.max(0, maxX) + 20, maxX));
        const initialTop = Math.max(40, Math.min(Math.random() * Math.max(0, maxY) + 40, maxY));
        window.style.left = `${initialLeft}px`;
        window.style.top = `${initialTop}px`;

        const fileTitle = this.formatTitleAsFile(title);
        window.dataset.fileName = fileTitle;

        window.innerHTML = `
            <div class="window-header">
                <span class="window-title">${fileTitle}</span>
                <div class="window-controls">
                    <div class="window-btn minimize" title="Minimize">−</div>
                    <div class="window-btn maximize" title="Maximize">□</div>
                    <div class="window-btn close" title="Close">✕</div>
                </div>
            </div>
            <div class="window-content">
                <div class="terminal-container" style="width:100%;height:100%;display:flex;flex-direction:column;">
                    <div class="terminal-header">
                        <span class="terminal-title">${title}</span>
                    </div>
                    <div class="terminal-body">
                        <div class="terminal-output"></div>
                        <div class="terminal-input-line">
                            <span class="prompt">sudo@rivsportfolio:~$</span>
                            <input type="text" class="terminal-input" autofocus>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('windowsContainer').appendChild(window);
        this.windows.push(window);

        // Setup window controls
        this.setupWindowControls(window);
        this.makeDraggable(window);

        // Show "too many windows" warning
        setTimeout(() => this.maybeShowTooManyWindowsWarning(), 10);

        return window;
    }

    setupWindowControls(window) {
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

        window.addEventListener('mousedown', () => this.focusWindow(window));
    }

    makeDraggable(windowElement) {
        const header = windowElement.querySelector('.window-header');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        const isInteractiveElement = (element) => {
            if (!element) return false;
            const tagName = element.tagName.toLowerCase();
            const interactiveTags = ['input', 'textarea', 'button', 'a', 'select', 'canvas'];
            if (interactiveTags.includes(tagName)) return true;
            if (element.closest('input, textarea, button, select, canvas')) return true;
            return false;
        };

        const startDrag = (e) => {
            if (e.target.classList.contains('window-btn')) return;
            if (isInteractiveElement(e.target)) return;
            
            isDragging = true;
            this.focusWindow(windowElement);
            
            const rect = windowElement.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            startX = e.clientX;
            startY = e.clientY;
            
            windowElement.style.transition = 'none';
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
                windowElement.classList.remove('dragging');
                document.body.style.userSelect = '';
            }
        };

        header.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }

    focusWindow(window) {
        this.windows.forEach(w => w.classList.remove('focused'));
        window.classList.add('focused');
        window.style.zIndex = ++this.windowZIndex;
        this.currentWindow = window;
    }

    closeWindow(window) {
        // Remove terminal instance if exists
        this.activeTerminals.delete(window.id);
        
        window.style.animation = 'windowFadeOut 0.2s ease-out forwards';
        setTimeout(() => {
            window.remove();
            this.windows = this.windows.filter(w => w !== window);
            this.removeFromTaskbar(window.id);
        }, 200);
    }

    minimizeWindow(window) {
        const isMinimized = window.dataset.minimized === 'true';
        
        if (isMinimized) {
            // Restore
            window.dataset.minimized = 'false';
            window.style.display = 'flex';
            this.focusWindow(window);
            this.removeFromTaskbar(window.id);
        } else {
            // Minimize
            window.dataset.minimized = 'true';
            window.style.display = 'none';
            this.addToTaskbar(window.id, window.dataset.fileName, window.dataset.app);
        }
    }

    maximizeWindow(window) {
        if (window.classList.contains('maximized')) {
            window.classList.remove('maximized');
            window.style.width = '600px';
            window.style.height = 'auto';
            window.style.left = window.dataset.originalLeft;
            window.style.top = window.dataset.originalTop;
        } else {
            window.dataset.originalLeft = window.style.left;
            window.dataset.originalTop = window.style.top;
            window.classList.add('maximized');
            window.style.width = '95vw';
            window.style.height = '90vh';
            window.style.left = '2.5vw';
            window.style.top = '5vh';
        }
    }

    addToTaskbar(windowId, title, appName) {
        const taskbar = document.getElementById('taskbarWindows');
        if (document.getElementById(`taskbar-btn-${windowId}`)) return;

        const btn = document.createElement('button');
        btn.id = `taskbar-btn-${windowId}`;
        btn.className = 'taskbar-window-btn';
        btn.textContent = title;
        btn.dataset.windowId = windowId;
        btn.dataset.app = appName;
        
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
    }

    removeFromTaskbar(windowId) {
        const btn = document.getElementById(`taskbar-btn-${windowId}`);
        if (btn) btn.remove();
    }

    cycleWindows() {
        if (this.windows.length === 0) return;
        
        const currentIndex = this.windows.indexOf(this.currentWindow);
        const nextIndex = (currentIndex + 1) % this.windows.length;
        this.focusWindow(this.windows[nextIndex]);
    }

    maybeShowTooManyWindowsWarning() {
        const userWindowCount = this.windows.filter(w => !w.classList.contains('transient-warning')).length;
        if (userWindowCount <= 3) return;

        const existing = document.querySelector('.retro-window.transient-warning');
        if (existing) return;

        const warning = this.createWindow('system-message', 'System Message', `warning-${Date.now()}`);
        warning.classList.add('transient-warning');
        warning.querySelector('.window-content').innerHTML = `
            <div class="warning-content">
                <p>You have ${userWindowCount} windows open. Consider closing some!</p>
            </div>
        `;
        
        setTimeout(() => this.closeWindow(warning), 5000);
    }

    formatTitleAsFile(title) {
        try {
            const t = String(title || 'file').trim();
            const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const lower = t.toLowerCase();
            
            if (lower.includes('snake') || lower.includes('pong') || lower.includes('game')) {
                return `${slug}.rom`;
            } else if (lower.includes('about') || lower.includes('contact') || lower.includes('help')) {
                return `${slug}.txt`;
            } else if (lower.includes('system') || lower.includes('monitor')) {
                return `${slug}.sys`;
            } else {
                return `${slug}.exe`;
            }
        } catch (e) {
            return title;
        }
    }

    updateDateTime() {
        try {
            const now = new Date();
            const timeOptions = { hour: '2-digit', minute: '2-digit' };
            const dateStr = now.toLocaleDateString();
            const timeStr = now.toLocaleTimeString(undefined, timeOptions);

            const centerBar = document.getElementById('topCenterBar');
            if (centerBar) {
                centerBar.textContent = `${dateStr} ${timeStr}`;
            }

            const gnomeClock = document.getElementById('gnomeClock');
            if (gnomeClock) {
                gnomeClock.textContent = timeStr;
            }
        } catch (err) {}
    }

    loadSettings() {
        try {
            const storedScheme = localStorage.getItem('rivs_colorScheme');
            const storedTheme = localStorage.getItem('rivs_theme');
            if (storedScheme) {
                const tempTerm = { addOutputLine: () => {}, executeCommand: () => {} };
                Object.setPrototypeOf(tempTerm, RetroTerminal.prototype);
                tempTerm.switchColorScheme(storedScheme, true);
            }
            if (storedTheme) {
                const tempTerm = { addOutputLine: () => {}, executeCommand: () => {} };
                Object.setPrototypeOf(tempTerm, RetroTerminal.prototype);
                tempTerm.switchTheme(storedTheme, true);
            }
        } catch (e) {}
    }
}

// Minimal placeholder so we can call RetroTerminal prototype methods that return HTML
function RetroTerminalPlaceholder() {}

// Helpers to run games inside a provided element
function setupSnakeInElement(container) {
    container.innerHTML = '<canvas id="snakeCanvasLocal" width="400" height="400" tabindex="0" style="outline:none;"></canvas><div class="game-instructions">Use arrow keys to move. Close window to stop.</div>';
    const canvas = container.querySelector('#snakeCanvasLocal');
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
    window.addEventListener('keydown', keyHandler);

    let last = 0;
    const speed = 8;

    const frame = (t) => {
        if (!running) return;
        if (!document.body.contains(canvas)) { running = false; window.removeEventListener('keydown', keyHandler); return; }
        if (t - last < 1000 / speed) { requestAnimationFrame(frame); return; }
        last = t;

        if (dir.x !== 0 || dir.y !== 0) {
            const head = { x: (snake[0].x + dir.x + cols) % cols, y: (snake[0].y + dir.y + rows) % rows };
            if (snake.some(s => s.x === head.x && s.y === head.y)) {
                running = false;
                window.removeEventListener('keydown', keyHandler);
                alert('Game Over! Score: ' + (snake.length - 1));
                return;
            }
            snake.unshift(head);
            if (food && head.x === food.x && head.y === food.y) {
                placeFood();
            } else {
                snake.pop();
            }
        }

        ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
        if (food) { ctx.fillStyle = '#ff3'; ctx.fillRect(food.x*size, food.y*size, size, size); }
        ctx.fillStyle = '#0f0'; snake.forEach((s, i) => { ctx.fillStyle = i===0 ? '#0ff' : '#0f0'; ctx.fillRect(s.x*size+1, s.y*size+1, size-2, size-2); });
        requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
}

function setupPongInElement(container) {
    container.innerHTML = '<canvas id="pongCanvasLocal" width="500" height="300" tabindex="0" style="outline:none;"></canvas><div class="game-instructions">W/S or ArrowUp/Down to move. First to 5 wins.</div>';
    const canvas = container.querySelector('#pongCanvasLocal');
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
            alert('Pong finished: ' + winner + ' wins (' + playerScore + '-' + aiScore + ')');
            window.removeEventListener('keydown', keyHandler); window.removeEventListener('keyup', keyHandler);
            return;
        }

        requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
}

// System Modal
function showModal(title, message) {
    const modal = document.getElementById('systemModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    modal.classList.add('visible');
    
    const closeModal = () => {
        modal.classList.remove('visible');
        document.getElementById('modalConfirm').removeEventListener('click', closeModal);
    };
    
    document.getElementById('modalConfirm').addEventListener('click', closeModal);
    setTimeout(closeModal, 3000);
}

// Boot Sequence
function startBootSequence() {
    return new Promise((resolve) => {
        const terminalOutput = document.getElementById('terminalOutput');
        if (!terminalOutput) {
            resolve();
            return;
        }

        const messages = [
            "Starting Ubuntu Desktop...",
            "Loading applications..."
        ];

        let msgIndex = 0;
        const typeMessage = () => {
            if (msgIndex >= messages.length) {
                setTimeout(resolve, 500);
                return;
            }

            const line = document.createElement('div');
            line.className = 'terminal-line boot-line';
            terminalOutput.appendChild(line);

            const msg = messages[msgIndex];
            let charIndex = 0;
            const typeChar = () => {
                if (charIndex < msg.length) {
                    line.textContent += msg[charIndex++];
                    setTimeout(typeChar, 20);
                } else {
                    const divLine = document.createElement('div');
                    divLine.className = 'terminal-line boot-divider';
                    divLine.textContent = '✓';
                    terminalOutput.appendChild(divLine);
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                    msgIndex++;
                    setTimeout(typeMessage, 300);
                }
            };
            typeChar();
        };

        typeMessage();
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await startBootSequence();
    window.ubuntuDesktop = new UbuntuDesktop();
    
    // Add global keyboard shortcut for terminal
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 't') {
            e.preventDefault();
            window.ubuntuDesktop.launchApp('terminal');
        }
    });
});

// Minimal placeholder so we can call RetroTerminal prototype methods that return HTML
function RetroTerminalPlaceholder() {}

// Helpers to run games inside a provided element (used by UbuntuDesktop.launchApp)
function setupSnakeInElement(container) {
    container.innerHTML = '<canvas id="snakeCanvasLocal" width="400" height="400" tabindex="0" style="outline:none;"></canvas><div class="game-instructions">Use arrow keys to move. Close window to stop.</div>';
    const canvas = container.querySelector('#snakeCanvasLocal');
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
    window.addEventListener('keydown', keyHandler);

    let last = 0;
    const speed = 8;

    const frame = (t) => {
        if (!running) return;
        if (!document.body.contains(canvas)) { running = false; window.removeEventListener('keydown', keyHandler); return; }
        if (t - last < 1000 / speed) { requestAnimationFrame(frame); return; }
        last = t;

        if (dir.x !== 0 || dir.y !== 0) {
            const head = { x: (snake[0].x + dir.x + cols) % cols, y: (snake[0].y + dir.y + rows) % rows };
            if (snake.some(s => s.x === head.x && s.y === head.y)) {
                running = false;
                window.removeEventListener('keydown', keyHandler);
                alert('Game Over! Score: ' + (snake.length - 1));
                return;
            }
            snake.unshift(head);
            if (food && head.x === food.x && head.y === food.y) {
                placeFood();
            } else {
                snake.pop();
            }
        }

        ctx.fillStyle = '#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
        if (food) { ctx.fillStyle = '#ff3'; ctx.fillRect(food.x*size, food.y*size, size, size); }
        ctx.fillStyle = '#0f0'; snake.forEach((s, i) => { ctx.fillStyle = i===0 ? '#0ff' : '#0f0'; ctx.fillRect(s.x*size+1, s.y*size+1, size-2, size-2); });
        requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
}

function setupPongInElement(container) {
    container.innerHTML = '<canvas id="pongCanvasLocal" width="500" height="300" tabindex="0" style="outline:none;"></canvas><div class="game-instructions">W/S or ArrowUp/Down to move. First to 5 wins.</div>';
    const canvas = container.querySelector('#pongCanvasLocal');
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
            alert('Pong finished: ' + winner + ' wins (' + playerScore + '-' + aiScore + ')');
            window.removeEventListener('keydown', keyHandler); window.removeEventListener('keyup', keyHandler);
            return;
        }

        requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
}