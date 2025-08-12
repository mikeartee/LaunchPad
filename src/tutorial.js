class TutorialSystem {
  constructor() {
    this.currentStep = 0;
    this.isActive = false;
    this.overlay = null;
    this.tooltip = null;
    this.steps = [
      {
        target: '.header h1',
        title: 'Welcome to LaunchPad!',
        content: 'Your universal project management tool. Let\'s get you started with a quick tour.',
        position: 'bottom'
      },
      {
        target: '#selectProjectBtn',
        title: 'Select Your Project',
        content: 'Click here to choose your project folder. It should contain "01-Planning Documents" and "03-Project Management" folders.',
        position: 'bottom',
        highlight: true
      },
      {
        target: '.tabs',
        title: 'Navigate Features',
        content: 'Use these tabs to access Tasks, Milestones, Timeline, and Revenue tracking.',
        position: 'bottom'
      },
      {
        target: '#refreshBtn',
        title: 'Refresh Data',
        content: 'Click here anytime to reload data from your CSV files.',
        position: 'left'
      }
    ];
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.currentStep = 0;
    this.createOverlay();
    this.showStep();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.overlay.innerHTML = `
      <div class="tutorial-backdrop"></div>
    `;
    document.body.appendChild(this.overlay);

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tutorial-tooltip';
    document.body.appendChild(this.tooltip);
  }

  showStep() {
    if (this.currentStep >= this.steps.length) {
      this.end();
      return;
    }

    const step = this.steps[this.currentStep];
    const target = document.querySelector(step.target);
    
    if (!target) {
      this.nextStep();
      return;
    }

    this.highlightElement(target, step.highlight);
    this.showTooltip(target, step);
  }

  highlightElement(element, highlight = false) {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });

    if (highlight) {
      element.classList.add('tutorial-highlight');
    }

    const rect = element.getBoundingClientRect();
    this.overlay.querySelector('.tutorial-backdrop').style.clipPath = 
      `polygon(0% 0%, 0% 100%, ${rect.left}px 100%, ${rect.left}px ${rect.top}px, ${rect.right}px ${rect.top}px, ${rect.right}px ${rect.bottom}px, ${rect.left}px ${rect.bottom}px, ${rect.left}px 100%, 100% 100%, 100% 0%)`;
  }

  showTooltip(target, step) {
    const rect = target.getBoundingClientRect();
    
    this.tooltip.innerHTML = `
      <div class="tutorial-content">
        <h3>${step.title}</h3>
        <p>${step.content}</p>
        <div class="tutorial-controls">
          <button class="tutorial-btn tutorial-skip">Skip Tour</button>
          <div class="tutorial-progress">
            <span>${this.currentStep + 1} of ${this.steps.length}</span>
          </div>
          <button class="tutorial-btn tutorial-next">${this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next'}</button>
        </div>
      </div>
      <div class="tutorial-arrow"></div>
    `;

    this.positionTooltip(rect, step.position);
    this.bindTooltipEvents();
  }

  positionTooltip(targetRect, position) {
    const tooltip = this.tooltip;
    const arrow = tooltip.querySelector('.tutorial-arrow');
    
    tooltip.style.position = 'fixed';
    tooltip.style.zIndex = '10001';
    
    switch (position) {
      case 'bottom':
        tooltip.style.top = `${targetRect.bottom + 10}px`;
        tooltip.style.left = `${targetRect.left + (targetRect.width / 2)}px`;
        tooltip.style.transform = 'translateX(-50%)';
        arrow.style.top = '-8px';
        arrow.style.left = '50%';
        arrow.style.transform = 'translateX(-50%) rotate(45deg)';
        break;
      case 'top':
        tooltip.style.bottom = `${window.innerHeight - targetRect.top + 10}px`;
        tooltip.style.left = `${targetRect.left + (targetRect.width / 2)}px`;
        tooltip.style.transform = 'translateX(-50%)';
        arrow.style.bottom = '-8px';
        arrow.style.left = '50%';
        arrow.style.transform = 'translateX(-50%) rotate(45deg)';
        break;
      case 'left':
        tooltip.style.top = `${targetRect.top + (targetRect.height / 2)}px`;
        tooltip.style.right = `${window.innerWidth - targetRect.left + 10}px`;
        tooltip.style.transform = 'translateY(-50%)';
        arrow.style.top = '50%';
        arrow.style.right = '-8px';
        arrow.style.transform = 'translateY(-50%) rotate(45deg)';
        break;
      case 'right':
        tooltip.style.top = `${targetRect.top + (targetRect.height / 2)}px`;
        tooltip.style.left = `${targetRect.right + 10}px`;
        tooltip.style.transform = 'translateY(-50%)';
        arrow.style.top = '50%';
        arrow.style.left = '-8px';
        arrow.style.transform = 'translateY(-50%) rotate(45deg)';
        break;
    }
  }

  bindTooltipEvents() {
    this.tooltip.querySelector('.tutorial-next').onclick = () => this.nextStep();
    this.tooltip.querySelector('.tutorial-skip').onclick = () => this.end();
  }

  nextStep() {
    this.currentStep++;
    this.showStep();
  }

  end() {
    this.isActive = false;
    
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }

    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });

    localStorage.setItem('launchpad-tutorial-completed', 'true');
  }

  shouldShowOnStartup() {
    return !localStorage.getItem('launchpad-tutorial-completed');
  }
}

// Quick help system for contextual assistance
class QuickHelp {
  constructor() {
    this.helpData = {
      'select-project': {
        title: 'Project Structure',
        content: `Your project folder should contain:
        <ul>
          <li><strong>01-Planning Documents/</strong> - Business Summary.md</li>
          <li><strong>03-Project Management/</strong> - Task List.csv & Gantt Chart.csv</li>
        </ul>`
      },
      'tasks': {
        title: 'Task Management',
        content: 'Check off completed tasks, add notes, assign team members, and track time spent.'
      },
      'revenue': {
        title: 'Revenue Calculator',
        content: 'Set your hourly rate and weekly hours to calculate monthly targets and track progress.'
      },
      'timeline': {
        title: 'Project Timeline',
        content: 'View your project as a Gantt chart with task dependencies and critical path.'
      }
    };
  }

  show(helpKey, targetElement) {
    const help = this.helpData[helpKey];
    if (!help) return;

    const existing = document.querySelector('.quick-help');
    if (existing) existing.remove();

    const helpDiv = document.createElement('div');
    helpDiv.className = 'quick-help';
    helpDiv.innerHTML = `
      <div class="quick-help-content">
        <button class="quick-help-close">&times;</button>
        <h4>${help.title}</h4>
        <div>${help.content}</div>
      </div>
    `;

    document.body.appendChild(helpDiv);

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      helpDiv.style.position = 'fixed';
      helpDiv.style.top = `${rect.bottom + 5}px`;
      helpDiv.style.left = `${rect.left}px`;
      helpDiv.style.zIndex = '9999';
    }

    helpDiv.querySelector('.quick-help-close').onclick = () => helpDiv.remove();
    
    setTimeout(() => {
      if (helpDiv.parentNode) helpDiv.remove();
    }, 8000);
  }
}

// Initialize systems
window.tutorialSystem = new TutorialSystem();
window.quickHelp = new QuickHelp();