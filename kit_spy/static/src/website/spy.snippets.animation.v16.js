/*
    patch 
*/
//@ref addons/website/static/src/js/content/snippets.animation.js 
odoo.define('spy.snippets.animation', function (require) {
    "use strict";
    const animation = require('website.content.snippets.animation')
    const registry = animation.registry;
    const Widget =  animation.Widget; //publicWidget.Widget,

    registry.WebsiteAnimate = Widget.extend({
        selector: '#wrapwrap',
        disabledInEditableMode: false,
    
        offsetRatio: 0.3, // Dynamic offset ratio: 0.3 = (element's height/3)
        offsetMin: 10, // Minimum offset for small elements (in pixels)
    
        /**
         * @override
         */
        start() {
            this.lastScroll = 0;
            this.$scrollingElement = $().getScrollingElement();
            //@@ step
            console.log("🔍🧐 spy.snippets.animation->start,patch ready!✅",this);
    
            // By default, elements are hidden by the css of o_animate.
            // Render elements and trigger the animation then pause it in state 0.
            this.$animatedElements = this.$target.find('.o_animate');
            // Fix for "transform: none" not overriding keyframe transforms on
            // iPhone 8 and lower.
            this.forceOverflowXYHidden = false;
            if (this.$animatedElements[0] && window.getComputedStyle(this.$animatedElements[0]).transform !== 'none') {
                this._toggleOverflowXYHidden(true);
                this.forceOverflowXYHidden = true;
            }
            _.each(this.$animatedElements, el => {
                if (el.closest('.dropdown')) {
                    el.classList.add('o_animate_in_dropdown');
                    return;
                }
                if (!el.classList.contains('o_animate_on_scroll')) {
                    this._resetAnimation($(el));
                }
            });
            // Then we render all the elements, the ones which are invisible
            // in state 0 (like fade_in for example) will stay invisible.
            this.$animatedElements.css("visibility", "visible");
    
            // We use addEventListener instead of jQuery because we need 'capture'.
            // Setting capture to true allows to take advantage of event bubbling
            // for events that otherwise don’t support it. (e.g. useful when
            // scrolling a modal)
            this.__onScrollWebsiteAnimate = _.throttle(this._onScrollWebsiteAnimate.bind(this), 10);
            //@@ step check 
            if (this.$scrollingElement[0]){
                this.$scrollingElement[0].addEventListener('scroll', this.__onScrollWebsiteAnimate, {capture: true});
            }    
            $(window).on('resize.o_animate, shown.bs.modal.o_animate, slid.bs.carousel.o_animate, shown.bs.tab.o_animate, shown.bs.collapse.o_animate', () => {
                this.windowsHeight = $(window).height();
                 //@@ step check 
                if ( this.$scrollingElement[0]){
                    this._scrollWebsiteAnimate(this.$scrollingElement[0]);
                }
            }).trigger("resize");
    
            return this._super(...arguments);
        },
        /**
         * @override
         */
        destroy() {
            this._super(...arguments);
            this.$target.find('.o_animate')
                .removeClass('o_animating o_animated o_animate_preview o_animate_in_dropdown')
                .css({
                    'animation-name': '',
                    'animation-play-state': '',
                    'visibility': '',
                });
            $(window).off('.o_animate');
            this.$scrollingElement[0].removeEventListener('scroll', this.__onScrollWebsiteAnimate, {capture: true});
            this.$scrollingElement[0].classList.remove('o_wanim_overflow_xy_hidden');
        },
    
        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------
    
        /**
         * Starts animation and/or update element's state.
         *
         * @private
         * @param {jQuery} $el
         */
        _startAnimation($el) {
            // Forces the browser to redraw using setTimeout.
            setTimeout(() => {
                this._toggleOverflowXYHidden(true);
                $el
                .css({"animation-play-state": "running"})
                .addClass("o_animating")
                .one('webkitAnimationEnd oanimationend msAnimationEnd animationend', () => {
                    $el.addClass("o_animated").removeClass("o_animating");
                    this._toggleOverflowXYHidden(false);
                    $(window).trigger("resize");
                });
            });
        },
        /**
         * @private
         * @param {jQuery} $el
         */
        _resetAnimation($el) {
            const animationName = $el.css("animation-name");
            $el.css({"animation-name": "dummy-none", "animation-play-state": ""})
               .removeClass("o_animated o_animating");
    
            this._toggleOverflowXYHidden(false);
            // trigger a DOM reflow
            void $el[0].offsetWidth;
            $el.css({'animation-name': animationName , 'animation-play-state': 'paused'});
        },
        /**
         * Shows/hides the horizontal scrollbar (on the #wrapwrap) and prevents
         * flicker of the page height (on the slideout footer).
         *
         * @private
         * @param {Boolean} add
         */
        _toggleOverflowXYHidden(add) {
            if (this.forceOverflowXYHidden) {
                return;
            }
            if (add) {
                this.$scrollingElement[0].classList.add('o_wanim_overflow_xy_hidden');
            } else if (!this.$scrollingElement.find('.o_animating').length) {
                this.$scrollingElement[0].classList.remove('o_wanim_overflow_xy_hidden');
            }
        },
        /**
         * Gets element top offset by not taking CSS transforms into calculations.
         *
         * @private
         * @param {Element} el
         * @param {HTMLElement} [topEl] if specified, calculates the top distance to
         *     this element.
         */
        _getElementOffsetTop(el, topEl) {
            // Loop through the DOM tree and add its parent's offset to get page offset.
            var top = 0;
            do {
                top += el.offsetTop || 0;
                el = el.offsetParent;
                if (topEl && el === topEl) {
                    return top;
                }
            } while (el);
            return top;
        },
        /**
         * @private
         * @param {Element} el
         */
        _scrollWebsiteAnimate(el) {
            _.each(this.$target.find('.o_animate:not(.o_animate_in_dropdown)'), el => {
                const $el = $(el);
                const elHeight = el.offsetHeight;
                const animateOnScroll = el.classList.contains('o_animate_on_scroll');
                let elOffset = animateOnScroll ? 0 : Math.max((elHeight * this.offsetRatio), this.offsetMin);
                const state = $el.css("animation-play-state");
    
                // We need to offset for the change in position from some animation.
                // So we get the top value by not taking CSS transforms into calculations.
                // Cookies bar might be opened and considered as a modal but it is
                // not really one (eg 'discrete' layout), and should not be used as
                // scrollTop value.
                const scrollTop = document.body.classList.contains('modal-open') ?
                    this.$target.find('.modal:visible').scrollTop() :
                    this.$scrollingElement.scrollTop();
                const elTop = this._getElementOffsetTop(el) - scrollTop;
                let visible;
                const footerEl = el.closest('.o_footer_slideout');
                const wrapEl = this.$target[0];
                if (footerEl && wrapEl.classList.contains('o_footer_effect_enable')) {
                    // Since the footer slideout is always in the viewport but not
                    // always displayed, the way to calculate if an element is
                    // visible in the footer is different. We decided to handle this
                    // case specifically instead of a generic solution using
                    // elementFromPoint as it is a rare case and the implementation
                    // would have been too complicated for such a small use case.
                    const actualScroll = wrapEl.scrollTop + this.windowsHeight;
                    const totalScrollHeight = wrapEl.scrollHeight;
                    const heightFromFooter = this._getElementOffsetTop(el, footerEl);
                    visible = actualScroll >=
                        totalScrollHeight - heightFromFooter - elHeight + elOffset;
                } else {
                    visible = this.windowsHeight > (elTop + elOffset) &&
                        0 < (elTop + elHeight - elOffset);
                }
                if (animateOnScroll) {
                    if (visible) {
                        const start = 100 / (parseFloat(el.dataset.scrollZoneStart) || 1);
                        const end = 100 / (parseFloat(el.dataset.scrollZoneEnd) || 1);
                        const out = el.classList.contains('o_animate_out');
                        const ratio = (out ? elTop + elHeight : elTop) / (this.windowsHeight - (this.windowsHeight / start));
                        const duration = parseFloat(window.getComputedStyle(el).animationDuration);
                        const delay = (ratio - 1) * (duration * end);
                        el.style.animationDelay = (out ? - duration - delay : delay) + "s";
                        el.classList.add('o_animating');
                        this._toggleOverflowXYHidden(true);
                    } else if (el.classList.contains('o_animating')) {
                        el.classList.remove('o_animating');
                        this._toggleOverflowXYHidden(false);
                    }
                } else {
                    if (visible && state === 'paused') {
                        $el.addClass('o_visible');
                        this._startAnimation($el);
                    } else if (!visible && $el.hasClass('o_animate_both_scroll') && state === 'running') {
                        $el.removeClass('o_visible');
                        this._resetAnimation($el);
                    }
                }
            });
        },
    
        //--------------------------------------------------------------------------
        // Handlers
        //--------------------------------------------------------------------------
    
        /**
         * @private
         * @param {Event} ev
         */
        _onScrollWebsiteAnimate(ev) {
            this._scrollWebsiteAnimate(ev.currentTarget);
        },
    });
});