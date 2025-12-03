// Terminal and Window Management System

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
        
        this.init();
    }

    init() {
        this.terminalInput.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.terminalInput.addEventListener('input', () => this.updateCursor());
        
        // Focus terminal input when clicking on terminal
        document.getElementById('terminalContainer').addEventListener('click', () => {
            this.terminalInput.focus();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.cycleWindows();
            }
        });

        // Prevent context menu on windows
        this.windowsContainer.addEventListener('contextmenu', (e) => e.preventDefault());

        // Initialize date/time display
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        // Helpful global key handling: if user presses `/` it focuses the terminal input
        // and inserts the `/` character so they can start typing even if the terminal
        // area is covered by windows. Ignore when an input/textarea/contentEditable is focused.
        document.addEventListener('keydown', (e) => {
            const active = document.activeElement;
            const isEditing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
            if (isEditing) return; // don't steal focus from real inputs

            if (e.key === '/') {
                e.preventDefault();
                this.terminalInput.focus();
                try {
                    const start = this.terminalInput.selectionStart || 0;
                    const end = this.terminalInput.selectionEnd || 0;
                    const val = this.terminalInput.value || '';
                    this.terminalInput.value = val.slice(0, start) + '/' + val.slice(end);
                    this.terminalInput.selectionStart = this.terminalInput.selectionEnd = start + 1;
                } catch (err) {
                    // fallback: just focus
                    this.terminalInput.focus();
                }
            }
        }, true);

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
            // Tab completion could be added here
        }
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.terminalInput.value = '';
            return;
        }
        
        this.terminalInput.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
    }

    updateCursor() {
        // Cursor is handled by CSS animation
    }

    processCommand() {
        const command = this.terminalInput.value.trim().toLowerCase();
        
        if (command === '') {
            this.addOutputLine('', 'prompt');
            return;
        }

        // Add command to history
        this.commandHistory.push(command);
        this.historyIndex = -1;

        // Display command
        this.addOutputLine(`sudo@rivsportfolio:~$ ${command}`, 'prompt');

        // Process command
        this.executeCommand(command);

        // Clear input
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
            case 'quote':
                this.showquote();
                break;
            case 'surprise':
                this.surprise();
                break;
            case 'neo':
                this.startneo();
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'exit':
            case 'quit':
                this.addOutputLine('Session cannot be closed. Type "help" for what can be used', 'error-text');
                break;
            default:
                this.addOutputLine(`${cmd}? What do you mean? Use "help" for what can be used.`, 'error-text');
        }
    }

    addOutputLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.innerHTML = text;
        this.terminalOutput.appendChild(line);
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }

    showHelp() {
        const commands = [
            { name: 'help', desc: 'available commands' },
            { name: 'about', desc: 'jus a lil about me' },
            { name: 'projects', desc: 'my projects' },
            { name: 'skills', desc: 'what I can do' },
            { name: 'contact', desc: 'contact me' },
            { name: 'quote', desc: 'wisdom' },
            { name: 'surprise', desc: 'dont use this one' },
            { name: 'neo', desc: 'what movie is that from??' },
            { name: 'clear', desc: 'clear terminal' }
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
                        <p>Primarily specializing in ESP32 projects, and I have made some PCBs as well.</p>
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
        // Persist projects on the instance so added technologies persist while the page is open
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

        // Render projects with read-only technology tags (no add/remove by viewers)
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
        // Render contact links instead of a form. Replace placeholders with your real info.
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

        // Stop neo on next command or after 30 seconds
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

    createWindow(title, contentGenerator, onMount = null, options = {}) {
        const windowId = `window-${Date.now()}`;
        const window = document.createElement('div');
        window.className = 'retro-window';
        window.id = windowId;
        window.style.zIndex = ++this.windowZIndex;
        
        // Random initial position
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
        this.focusWindow(window);

        // Make window draggable
        this.makeDraggable(window);

        // Window controls
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

        // Call onMount callback if provided
        if (onMount) {
            setTimeout(() => onMount(), 0);
        }

        // If allowed, check whether too many windows are open and show a transient warning
        // `options.skipAutoWarning` can be set to true to avoid recursion when creating the warning itself
        if (!options.skipAutoWarning) {
            // defer slightly so the DOM has applied styles/measurements
            setTimeout(() => this.maybeShowTooManyWindowsWarning(), 10);
        }

        return window;
    }

    maybeShowTooManyWindowsWarning() {
        // Don't create multiple warnings
        const existing = this.windowsContainer.querySelector('.retro-window.transient-warning');
        // Count only user windows (exclude transient warning windows)
        const userWindowCount = this.windows.filter(w => !w.classList.contains('transient-warning')).length;

        if (userWindowCount > 2 && !existing) {
            const warningWindow = this.createWindow('Notice', () => {
                return `<div class="warning-content">Are you gonna close these?</div>`;
            }, null, { skipAutoWarning: true });

            // Mark as transient so it won't trigger more warnings
            warningWindow.classList.add('transient-warning');

            // Try to center near top for visibility
            setTimeout(() => {
                try {
                    const w = warningWindow.offsetWidth || 360;
                    warningWindow.style.left = `${Math.max(20, (window.innerWidth - w) / 2)}px`;
                    warningWindow.style.top = `80px`;
                } catch (e) {
                    // ignore positioning errors
                }
            }, 0);

            // Auto-dismiss after 3 seconds
            setTimeout(() => {
                this.closeWindow(warningWindow);
            }, 3000);
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
            // Check if element is inside a form input
            if (element.closest('input, textarea, button, select')) return true;
            return false;
        };

        const startDrag = (e) => {
            // Don't drag if clicking on window control buttons
            if (e.target && e.target.classList.contains('window-btn')) return;
            
            // Don't drag if clicking directly on interactive elements
            if (isInteractiveElement(e.target)) return;
            
            // Don't drag if clicking on labels (they should trigger their inputs)
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
            
            // Constrain to viewport
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

        // Make header draggable - always works
        header.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('window-btn')) {
                startDrag(e);
            }
        });
        
        // Make window content draggable (but not interactive elements)
        content.addEventListener('mousedown', (e) => {
            // Only start drag if not clicking on interactive elements
            if (!isInteractiveElement(e.target) && e.target.tagName !== 'LABEL') {
                startDrag(e);
            }
        });

        // Touch support for mobile
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

        // Global event listeners - use capture phase to ensure we catch events
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
        // Remove focus from all windows
        this.windows.forEach(w => w.classList.remove('focused'));
        
        // Focus this window
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
        const content = window.querySelector('.window-content');
        if (content.style.display === 'none') {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
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

// Initialize terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Each page load: ask whether the ASCII art hurts the user's eyes.
    // If they choose to hide it, replace the ASCII block with a plain text
    // title for this load only (no persistence).
    try {
        const asciiEl = document.querySelector('.terminal-line.ascii-art');
        const asciiModal = document.getElementById('asciiModal');
        const textSizeModal = document.getElementById('textSizeModal');
        
        if (asciiModal) {
            // show ASCII modal
            asciiModal.classList.add('visible');
            asciiModal.setAttribute('aria-hidden', 'false');

            const hideBtn = asciiModal.querySelector('.modal-btn-hide');
            const keepBtn = asciiModal.querySelector('.modal-btn-keep');

            const closeAsciiModal = () => {
                asciiModal.classList.remove('visible');
                asciiModal.setAttribute('aria-hidden', 'true');
                // After ASCII modal closes, show text size modal
                showTextSizeModal();
            };

            if (hideBtn) hideBtn.addEventListener('click', () => {
                if (asciiEl) asciiEl.innerHTML = '<div class="plain-title">Riv\'s Portfolio</div>';
                closeAsciiModal();
            });

            if (keepBtn) keepBtn.addEventListener('click', () => {
                closeAsciiModal();
            });
        }

        const showTextSizeModal = () => {
            if (textSizeModal) {
                textSizeModal.classList.add('visible');
                textSizeModal.setAttribute('aria-hidden', 'false');

                const enlargeBtn = textSizeModal.querySelector('.modal-btn-enlarge');
                const normalBtn = textSizeModal.querySelector('.modal-btn-normal');

                const closeTextSizeModal = () => {
                    textSizeModal.classList.remove('visible');
                    textSizeModal.setAttribute('aria-hidden', 'true');
                    // After text size modal closes, initialize terminal
                    new RetroTerminal();
                };

                const showFadeMessage = () => {
                    const modalBox = textSizeModal.querySelector('.modal-box');
                    const originalContent = modalBox.innerHTML;
                    modalBox.innerHTML = '<div style="font-size: 24px; color: #00ff88; text-shadow: 0 0 10px #00ff88;">old...</div>';
                    
                    setTimeout(() => {
                        textSizeModal.classList.remove('visible');
                        textSizeModal.setAttribute('aria-hidden', 'true');
                        modalBox.innerHTML = originalContent;
                        new RetroTerminal();
                    }, 1500);
                };

                if (enlargeBtn) enlargeBtn.addEventListener('click', () => {
                    document.body.classList.add('enlarged-text');
                    showFadeMessage();
                });

                if (normalBtn) normalBtn.addEventListener('click', () => {
                    showFadeMessage();
                });
            } else {
                // If text size modal not found, initialize terminal anyway
                new RetroTerminal();
            }
        };

        // If ASCII modal not found, show text size modal directly
        if (!asciiModal) {
            showTextSizeModal();
        }
    } catch (e) {
        // ignore if DOM not found, just initialize terminal
        new RetroTerminal();
    }
});

