'use strict';
const getMousePosition = (e) => {
    return 0;
};

class HorizontalScrollingMenu {
    constructor(el, opts) {
        this.el = el;
        this.opts = {
            navigation: false,
            navigationDistance: 150,
            drag: false
        };

        Object.assign(this.opts, opts);

        this.scroller = el.firstElementChild;
        this.content = this.scroller.firstElementChild;

        this.onChange = this.onChange.bind(this);
        this.navigate = this.navigate.bind(this);
        this.afterNavigate = this.afterNavigate.bind(this);
        this.tap = this.tap.bind(this);
        this.drag = this.drag.bind(this);
        this.release = this.release.bind(this);
        this.track = this.track.bind(this);
        this.autoScroll = this.autoScroll.bind(this);

        // Runtime variables.
        this.ticking = false;
        this.animating = false;
        this.pressed = false;
        this.startDragX = 0;
        this.draggedOffset = 0;
        this.dragMax = 0;
        this.dragMin = 0;

        this.velocity = 0;
        this.amplitude = 0;
        this.frame = 0;
        this.timestamp = 0;
        this.ticker = null;

        this.init();
    }

    getOverflowDirections() {
        const {scroller, content} = this;
        const {right: scrollerRight, left: scrollerLeft} = scroller.getBoundingClientRect();
        const {right: contentRight, left: contentLeft} = content.getBoundingClientRect();

        if (scrollerLeft > contentLeft && scrollerRight < contentRight) {
            return 'both';

        } else if (contentLeft < scrollerLeft) {
            return 'left';

        } else if (contentRight > scrollerRight) {
            return 'right';

        } else {
            return 'none';
        }
    }

    setOverflowDirections() {
        this.el.setAttribute('data-overflow-direction', this.getOverflowDirections());
    }

    addNavButtons() {
        this.navButtons = {};

        for (let direction of ['left', 'right']) {
            const button = document.createElement('button');

            button.classList.add('hsm__navbutton');
            button.classList.add('hsm__navbutton--' + direction);
            button.classList.add('hsm__navbutton--' + direction);
            button.setAttribute('data-direction', direction);

            this.navButtons[direction] = button;
            this.el.appendChild(button);
        }
    }

    navigate(e) {
        const target = e.target,
              direction = target.getAttribute('data-direction'),
              {scroller, content, opts} = this,
              {navigationDistance} = opts,
              directionMultiplyer = (direction === 'right') ? -1 : 1;

        let overflow = 0,
            distance = navigationDistance;

        if (this.animating === true) {
            return;
        }

        content.style.transitionProperty = 'transform';

        if (direction === 'right') {
            overflow = content.getBoundingClientRect().right - scroller.getBoundingClientRect().right;
        } else if (direction === 'left') {
            overflow = scroller.scrollLeft;
        }

        if (overflow < distance) {
            distance = overflow;
        }

        if (overflow < distance * 1.2) {
            distance = distance + overflow;
        }

        content.style.transform = 'translateX(' + (distance * directionMultiplyer) + 'px)';
        this.animating = true;
    }

    afterNavigate() {
        const {content, scroller, opts} = this,
              {navigationDistance} = opts,
              computedStyles = getComputedStyle(content),
              matrix = computedStyles.getPropertyValue('-webkit-transform') || computedStyles.getPropertyValue('transform'),
              translateX = parseInt(matrix.split(',')[4]) || 0,
              scrollLeft = scroller.scrollLeft;

        content.style.transitionProperty = 'none';
        content.style.transform = 'none';
        scroller.scrollLeft = scrollLeft - translateX;

        this.animating = false;
    }

    onChange() {
        const self = this;

        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                self.setOverflowDirections();
                self.ticking = false;
            });
        }

        this.ticking = true;
    }

    tap(e) {
        const {content, scroller} = this;

        this.afterNavigate();
        this.draggedOffset = 0;

        this.dragMax = content.offsetWidth - scroller.offsetWidth;
        this.pressed = true;
        this.startDragX = e.clientX;

        this.velocity = this.amplitude = 0;
        this.frame = this.dragOffset = 0;
        this.timestamp = Date.now();
        clearInterval(this.ticker);
        this.ticker = setInterval(this.track, 100);

        content.style.transitionProperty = 'none';
        window.addEventListener('mouseup', this.release);
        e.preventDefault();
    }

    drag(e) {
        const {content} = this;
        let x, delta;

        if (this.pressed) {
            x = e.clientX;
            delta = this.startDragX - x;
            if (delta > 2 || delta < -2) {
                this.startDragX = x;

                this.draggedOffset = this.draggedOffset - delta;
                this.draggedOffset = Math.max(this.draggedOffset, this.getCurrentDragMin());
                this.draggedOffset = Math.min(this.draggedOffset, this.getCurrentDragMax());

                content.style.transform = 'translateX(' + (this.draggedOffset) + 'px)';
            }
        }
    }

    track() {
        let now = Date.now(),
            elapsed = now - this.timestamp,
            delta = this.draggedOffset - this.frame,
            v = 1000 * delta / (1 + elapsed);

        this.timestamp = now;
        this.frame = this.draggedOffset;

        v = 1000 * delta / (1 + elapsed);
        this.velocity = 0.8 * v + 0.2 * this.velocity;
        console.log(this.velocity);
    }

    release() {
        this.pressed = false;
        clearInterval(this.ticker);

        if (this.velocity > 10 || this.velocity < -10) {
            this.amplitude = 0.8 * this.velocity;
            this.scrollTarget = Math.round(this.draggedOffset + this.amplitude);

            this.scrollTarget = Math.max(this.scrollTarget, this.getCurrentDragMin());
            this.scrollTarget = Math.min(this.scrollTarget, this.getCurrentDragMax());

            this.timestamp = Date.now();
            requestAnimationFrame(this.autoScroll);
        } else {
            this.afterNavigate();
            this.draggedOffset = 0;
        }

        window.removeEventListener('mouseup', this.release);
    }

    autoScroll() {
        var elapsed, delta, timeConstant = 325;
        if (this.amplitude) {
            elapsed = Date.now() - this.timestamp;
            delta = -this.amplitude * Math.exp(-elapsed / timeConstant);

            this.draggedOffset = Math.max(this.scrollTarget + delta, this.getCurrentDragMin());
            this.draggedOffset = Math.min(this.draggedOffset, this.getCurrentDragMax());

            if (delta > 0.5 || delta < -0.5) {
                this.content.style.transform = 'translateX(' + (this.draggedOffset) + 'px)';
                requestAnimationFrame(this.autoScroll);

            } else {
                this.content.style.transform = 'translateX(' + (this.draggedOffset) + 'px)';
                this.afterNavigate();
                this.draggedOffset = 0;
            }
        }
    }

    getCurrentDragMax() {
        const {scroller} = this;
        return scroller.scrollLeft;
    }

    getCurrentDragMin() {
        const {scroller, content} = this;
        return scroller.offsetWidth - content.offsetWidth + scroller.scrollLeft;
    }

    addEventListeners() {
        const {el, opts} = this;
        const {navigation, drag} = opts;

        this.scroller.addEventListener('scroll', this.onChange);
        window.addEventListener('resize', this.onChange);

        if (navigation) {
            for (let key in this.navButtons) {
                this.navButtons[key].addEventListener('click', this.navigate);
            }
            this.content.addEventListener('transitionend', this.afterNavigate);
        }

        if (drag) {
            el.addEventListener('mousedown', this.tap);
            el.addEventListener('mousemove', this.drag);
        }
    }

    init() {
        const {navigation} = this.opts;

        if (navigation) {
            this.addNavButtons();
        }

        this.setOverflowDirections();
        this.addEventListeners();
    }
}

export default HorizontalScrollingMenu;
