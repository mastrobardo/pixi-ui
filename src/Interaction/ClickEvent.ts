import * as PIXI from 'pixi.js';

export class ClickEvent
{
    private bound: boolean;
    private id: number;
    private ishover: boolean;
    private obj: any;

    private movementX: number;
    private movementY: number;

    right: boolean;
    hover: boolean;
    double: boolean;

    mouse: PIXI.Point;
    offset: PIXI.Point;

    private eventname_mousedown: string;
    private eventname_mouseup: string;
    private eventname_mouseupoutside: string;

    time: number;

    constructor(obj, includeHover?: boolean, rightMouseButton?, doubleClick?: boolean)
    {
        this.obj = obj;
        this.bound = false;
        this.id = 0;
        this.ishover = false;
        this.mouse = new PIXI.Point();
        this.offset = new PIXI.Point();
        this.movementX = 0;
        this.movementY = 0;
        this.right = typeof rightMouseButton === 'undefined' ? false : rightMouseButton;
        this.hover = typeof includeHover === 'undefined' ? true : includeHover;
        this.double = typeof doubleClick === 'undefined' ? false : doubleClick;

        this.eventname_mousedown = this.right ? 'rightdown' : 'mousedown';
        this.eventname_mouseup = this.right ? 'rightup' : 'mouseup';
        this.eventname_mouseupoutside = this.right ? 'rightupoutside' : 'mouseupoutside';

        obj.container.interactive = true;
        this.time = 0;

        this.startEvent();
    }

    _onMouseDown = (event): void =>
    {
        const {
            obj,
            eventname_mouseup,
            _onMouseUp,
            eventname_mouseupoutside,
            _onMouseUpOutside,
            right,
        } = this;

        this.mouse.copyFrom(event.data.global);
        this.id = event.data.identifier;
        this.onPress.call(this.obj, event, true);

        if (!this.bound)
        {
            obj.container.on(eventname_mouseup, _onMouseUp);
            obj.container.on(eventname_mouseupoutside, _onMouseUpOutside);

            if (!right)
            {
                obj.container.on('touchend', _onMouseUp);
                obj.container.on('touchendoutside', _onMouseUpOutside);
            }

            this.bound = true;
        }

        if (this.double)
        {
            const now = performance.now();

            if (now - this.time < 210)
            {
                this.onClick.call(obj, event);
            }
            else
            {
                this.time = now;
            }
        }

        event.data.originalEvent.preventDefault();
    };

    _mouseUpAll = (event): void =>
    {
        const {
            obj,
            eventname_mouseup,
            _onMouseUp,
            eventname_mouseupoutside,
            _onMouseUpOutside,
        } = this;

        if (event.data.identifier !== this.id)
        {
            return;
        }

        this.offset.set(event.data.global.x - this.mouse.x, event.data.global.y - this.mouse.y);

        if (this.bound)
        {
            obj.container.removeListener(eventname_mouseup, _onMouseUp);
            obj.container.removeListener(eventname_mouseupoutside, _onMouseUpOutside);

            if (!this.right)
            {
                obj.container.removeListener('touchend', _onMouseUp);
                obj.container.removeListener('touchendoutside', _onMouseUpOutside);
            }

            this.bound = false;
        }

        this.onPress.call(obj, event, false);
    };

    _onMouseUp = (event): void =>
    {
        if (event.data.identifier !== this.id)
        {
            return;
        }

        this._mouseUpAll(event);

        // prevent clicks with scrolling/dragging objects
        if (this.obj.dragThreshold)
        {
            this.movementX = Math.abs(this.offset.x);
            this.movementY = Math.abs(this.offset.y);

            if (Math.max(this.movementX, this.movementY) > this.obj.dragThreshold)
            {
                return;
            }
        }

        if (!this.double)
        {
            this.onClick.call(this.obj, event);
        }
    };

    _onMouseUpOutside = (event): void =>
    {
        if (event.data.identifier !== this.id)
        {
            return;
        }

        this._mouseUpAll(event);
    };

    _onMouseOver = (event): void =>
    {
        if (!this.ishover)
        {
            this.ishover = true;
            this.obj.container.on('mousemove', this._onMouseMove);
            this.obj.container.on('touchmove', this._onMouseMove);

            this.onHover.call(this.obj, event, true);
        }
    };

    _onMouseOut = (event): void =>
    {
        if (this.ishover)
        {
            this.ishover = false;
            this.obj.container.removeListener('mousemove', this._onMouseMove);
            this.obj.container.removeListener('touchmove', this._onMouseMove);

            this.onHover.call(this.obj, event, false);
        }
    };

    _onMouseMove = (event): void =>
    {
        this.onMove.call(this.obj, event);
    };

    stopEvent = (): void =>
    {
        const {
            obj,
            eventname_mouseup,
            _onMouseUp,
            eventname_mouseupoutside,
            _onMouseUpOutside,
            _onMouseDown,
            _onMouseOver,
            _onMouseOut,
            _onMouseMove,
        } = this;

        if (this.bound)
        {
            obj.container.removeListener(eventname_mouseup, _onMouseUp);
            obj.container.removeListener(eventname_mouseupoutside, _onMouseUpOutside);

            if (!this.right)
            {
                obj.container.removeListener('touchend', _onMouseUp);
                obj.container.removeListener('touchendoutside', _onMouseUpOutside);
            }

            this.bound = false;
        }

        obj.container.removeListener(eventname_mousedown, _onMouseDown);

        if (!this.right)
        {
            obj.container.removeListener('touchstart', _onMouseDown);
        }

        if (this.hover)
        {
            obj.container.removeListener('mouseover', _onMouseOver);
            obj.container.removeListener('mouseout', _onMouseOut);
            obj.container.removeListener('mousemove', _onMouseMove);
            obj.container.removeListener('touchmove', _onMouseMove);
        }
    };

    startEvent = (): void =>
    {
        const {
            obj,
            eventname_mousedown,
            _onMouseDown,
            _onMouseOver,
            _onMouseOut,
        } = this;

        obj.container.on(eventname_mousedown, _onMouseDown);

        if (!this.right)
        {
            obj.container.on('touchstart', _onMouseDown);
        }

        if (this.hover)
        {
            obj.container.on('mouseover', _onMouseOver);
            obj.container.on('mouseout', _onMouseOut);
        }
    };

    onHover(event, over): void
    {

    }

    onPress(event, isPressed): void
    {

    }

    onClick(event): void
    {

    }

    onMove(event): void
    {

    }
}
