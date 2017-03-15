'use strict';
class HorizontalScrollingMenu {
    constructor(el, opts) {
        this.el = el;
        this.opts = {
            navigation: false,
            navigationDistance: 150
        };

        Object.assign(this.opts, opts);

        this.scroller = el.firstElementChild;
        this.content = this.scroller.firstElementChild;

        this.onChange = this.onChange.bind(this);
        this.navigate = this.navigate.bind(this);
        this.afterNavigate = this.afterNavigate.bind(this);

        this.ticking = false;
        this.animating = false;

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

    addEventListeners() {
        const {navigation} = this.opts;

        this.scroller.addEventListener('scroll', this.onChange);
        window.addEventListener('resize', this.onChange);

        if (navigation) {
            for (let key in this.navButtons) {
                this.navButtons[key].addEventListener('click', this.navigate);
            }
            this.content.addEventListener('transitionend', this.afterNavigate);
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
