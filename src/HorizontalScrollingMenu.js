'use strict';
class HorizontalScrollingMenu {
    constructor(el, opts) {
        this.el = el;
        this.scroller = el.firstElementChild;
        this.content = this.scroller.firstElementChild;

        this.onChange = this.onChange.bind(this);

        this.ticking = false;

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
        this.scroller.addEventListener('scroll', this.onChange);
        window.addEventListener('resize', this.onChange);
    }

    init() {
        this.setOverflowDirections();
        this.addEventListeners();
    }
}

export default HorizontalScrollingMenu;
